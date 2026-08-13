"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { OnboardingPayload } from "@/features/onboarding/types";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateUser } from "@/lib/db/queries/users";
import { createWorkspaceInvitation } from "@/lib/db/queries/workspaceInvitations";
import { createWorkspace } from "@/lib/db/queries/workspaces";
import { sendWorkspaceInvitationEmail } from "@/lib/email/send-workspace-invitation";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function completeOnboardingAction(data: OnboardingPayload) {
	const user = await getCurrentUser();

	const validatedData = onboardingSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid onboarding data",
		};
	}

	const workspace = await db.transaction(async (tx) => {
		const workspace = await createWorkspace(
			user.id,
			validatedData.data.workspace,
			tx,
		);

		const invitations = [];

		for (const invite of validatedData.data.invites) {
			const invitation = await createWorkspaceInvitation(
				{
					workspaceId: workspace.id,
					email: invite.email,
					role: invite.role,
					invitedById: user.id,
					token: nanoid(32),
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
				tx,
			);

			invitations.push(invitation);

			await createActivity(
				{
					workspaceId: workspace.id,
					actorId: user.id,
					action: "created",
					entity: "workspace_invitation",
					entityId: invitation.id,
					metadata: {
						email: invitation.email,
						role: invitation.role,
					},
				},
				tx,
			);
		}

		await updateUser(
			user.id,
			{
				lastWorkspaceId: workspace.id,
				occupation: validatedData.data.occupation,
			},
			tx,
		);

		await createActivity(
			{
				workspaceId: workspace.id,
				actorId: user.id,
				action: "created",
				entity: "workspace",
				entityId: workspace.id,
			},
			tx,
		);

		return {
			workspace,
			invitations,
		};
	});

	// Outside the transaction for sending invites
	for (const invitation of workspace.invitations) {
		const emailResult = await sendWorkspaceInvitationEmail({
			email: invitation.email,
			workspaceName: workspace.workspace.name,
			token: invitation.token,
		});

		if (!emailResult.success) {
			console.warn(
				`Invitation ${invitation.id} created but email failed to send.`,
			);
		}
	}

	revalidatePath(`/w/${workspace.workspace.slug}/dashboard`);

	return {
		success: true as const,
		data: workspace.workspace,
	};
}
