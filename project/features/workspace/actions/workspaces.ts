"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { CreateWorkspacePayload } from "@/features/workspace/types";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateUser } from "@/lib/db/queries/users";
import { createWorkspaceInvitation } from "@/lib/db/queries/workspaceInvitations";
import {
	getWorkspaceMemberById,
	transferWorkspaceOwnership,
} from "@/lib/db/queries/workspaceMembers";
import {
	createWorkspace,
	getUserOwnedWorkspaces,
	getUserWorkspaceById,
	getUserWorkspaces,
	updateWorkspace,
} from "@/lib/db/queries/workspaces";
import { sendWorkspaceInvitationEmail } from "@/lib/email/send-workspace-invitation";
import { dispatchNotifications } from "@/lib/notifications";
import {
	requireWorkspaceMember,
	requireWorkspaceOwner,
} from "@/lib/permission";
import {
	createWorkspaceSchema,
	type UpdateWorkspaceInput,
	updateWorkspaceSchema,
} from "@/lib/validations/workspace";

export async function createWorkspaceAction(data: CreateWorkspacePayload) {
	const user = await getCurrentUser();

	const validatedWorkspace = createWorkspaceSchema.safeParse(data.workspace);

	if (!validatedWorkspace.success) {
		return {
			success: false as const,
			message: "Invalid workspace data",
		};
	}

	const result = await db.transaction(async (tx) => {
		const workspace = await createWorkspace(
			user.id,
			validatedWorkspace.data,
			tx,
		);

		const invitations = [];

		for (const invite of data.invites ?? []) {
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
				metadata: {
					name: workspace.name,
				},
			},
			tx,
		);

		return {
			workspace,
			invitations,
		};
	});

	// Send emails AFTER the transaction commits
	for (const invitation of result.invitations) {
		const emailResult = await sendWorkspaceInvitationEmail({
			email: invitation.email,
			workspaceName: result.workspace.name,
			token: invitation.token,
		});

		if (!emailResult.success) {
			console.warn(
				`Invitation ${invitation.id} created but email failed to send.`,
			);
		}
	}

	revalidatePath("/");
	revalidatePath("/workspaces");
	revalidatePath(`/w/${result.workspace.slug}/dashboard`);

	return {
		success: true as const,
		data: result.workspace,
	};
}

// READ

export async function getCurrentWorkspaceAction() {
	const user = await getCurrentUser();

	if (user.lastWorkspaceId) {
		const membership = await getUserWorkspaceById(
			user.lastWorkspaceId,
			user.id,
		);

		if (membership?.workspace) {
			return {
				success: true as const,
				data: membership.workspace,
			};
		}
	}

	const workspaces = await getUserWorkspaces(user.id);

	if (workspaces.length === 0) {
		return {
			success: true as const,
			data: null,
		};
	}

	const workspace = workspaces[0];

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
	});

	return {
		success: true as const,
		data: workspace,
	};
}

export async function getCurrentUserOwnedWorkspaces() {
	const user = await getCurrentUser();

	const workspaces = await getUserOwnedWorkspaces(user.id);

	return {
		success: true as const,
		data: workspaces,
	};
}

// UPDATE

export async function updateWorkspaceAction(
	workspaceSlug: string,
	data: UpdateWorkspaceInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateWorkspaceSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid data",
		};
	}

	const access = await requireWorkspaceOwner(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const updatedWorkspace = await updateWorkspace(
		workspace.id,
		validatedData.data,
	);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "workspace",
		entityId: workspace.id,
		metadata: {
			name: updatedWorkspace.name,
		},
	});

	revalidatePath(`/w/${updatedWorkspace.slug}`, "layout");

	return {
		success: true as const,
		data: updatedWorkspace,
	};
}

export async function transferWorkspaceOwnershipAction(
	workspaceSlug: string,
	newOwnerUserId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceOwner(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	if (newOwnerUserId === user.id) {
		return {
			success: false as const,
			message: "You are already the owner of this workspace.",
		};
	}

	const newOwner = await getWorkspaceMemberById(workspace.id, newOwnerUserId);

	if (!newOwner) {
		return {
			success: false as const,
			message: "That user is not a member of this workspace.",
		};
	}

	const transferredMember = await transferWorkspaceOwnership(
		workspace.id,
		user.id,
		newOwnerUserId,
	);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "transferred",
		entity: "workspace_member",
		entityId: transferredMember.id,
		metadata: {
			name: workspace.name,
		},
	});

	await dispatchNotifications([
		{
			type: "workspace_ownership_transferred",
			recipientId: newOwnerUserId,
			actorId: user.id,
			workspaceId: workspace.id,
			entityId: transferredMember.id,
			metadata: { workspaceName: workspace.name },
		},
	]);

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true as const,
		data: transferredMember,
	};
}

export async function switchWorkspaceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
	});

	revalidatePath(`/w/${workspace.slug}/dashboard`);

	return {
		success: true as const,
		message: "Workspace switched successfully",
	};
}
