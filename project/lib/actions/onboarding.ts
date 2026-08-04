"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OnboardingPayload } from "@/types/onboarding";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { updateUser } from "../db/queries/users";
import { createWorkspaceInvitation } from "../db/queries/workspaceInvitations";
import { createWorkspace } from "../db/queries/workspaces";
import { onboardingSchema } from "../validations/onboarding";

export async function completeOnboardingAction(data: OnboardingPayload) {
	const user = await getCurrentUser();

	const validatedData = onboardingSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: "Invalid onboarding data",
		};
	}

	const workspace = await createWorkspace(
		user.id,
		validatedData.data.workspace,
	);

	for (const invite of validatedData.data.invites) {
		const invitation = await createWorkspaceInvitation({
			workspaceId: workspace.id,
			email: invite.email,
			role: invite.role,
			invitedById: user.id,
			token: nanoid(32),
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		await createActivity({
			workspaceId: workspace.id,
			actorId: user.id,
			action: "created",
			entity: "workspace_invitation",
			entityId: invitation.id,
			metadata: {
				email: invitation.email,
				role: invitation.role,
			},
		});
	}

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
		occupation: validatedData.data.occupation,
	});

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "created",
		entity: "workspace",
		entityId: workspace.id,
	});

	revalidatePath(`/w/${workspace.slug}/dashboard`);

	return {
		success: true,
		data: workspace,
	};
}
