"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { getUserByEmail } from "../db/queries/users";
import {
	createWorkspaceInvitation,
	getWorkspaceInvitationByEmail,
	getWorkspaceInvitationById,
	getWorkspaceInvitationByToken,
	getWorkspaceInvitations,
	updateWorkspaceInvitation,
} from "../db/queries/workspaceInvitations";
import {
	addWorkspaceMember,
	getWorkspaceMember,
} from "../db/queries/workspaceMembers";
import { getWorkspaceById } from "../db/queries/workspaces";
import { sendWorkspaceInvitationEmail } from "../email/send-workspace-invitation";
import { isInvitationExpired, requireWorkspaceAdmin } from "../permission";
import {
	type CreateWorkspaceInvitationInput,
	createWorkspaceInvitationSchema,
} from "../validations/workspaceInvitation";

// Workspace Invitation Actions

export async function getWorkspaceInvitationsAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const invitations = await getWorkspaceInvitations(workspace.id);

	return invitations;
}

export async function createWorkspaceInvitationAction(
	workspaceSlug: string,
	data: CreateWorkspaceInvitationInput,
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const validatedData = createWorkspaceInvitationSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid invitation data.",
		};
	}

	const existingUser = await getUserByEmail(validatedData.data.email);

	if (existingUser) {
		const existingMember = await getWorkspaceMember(
			workspace.id,
			existingUser.id,
		);

		if (existingMember) {
			return {
				success: false,
				error: "User is already a member of this workspace.",
			};
		}
	}

	const existingInvitation = await getWorkspaceInvitationByEmail(
		workspace.id,
		validatedData.data.email,
	);

	if (existingInvitation) {
		return {
			success: false,
			error: "An invitation has already been sent to this email.",
		};
	}

	const invitation = await createWorkspaceInvitation({
		...validatedData.data,
		workspaceId: workspace.id,
		invitedById: user.id,
		token: nanoid(32),
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});

	await sendWorkspaceInvitationEmail({
		email: invitation.email,
		workspaceName: workspace.name,
		token: invitation.token,
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

	revalidatePath(`/workspaces/${workspace.slug}/settings/members`);

	return {
		success: true,
		data: invitation,
	};
}

export async function revokeWorkspaceInvitationAction(
	workspaceSlug: string,
	invitationId: string,
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const invitation = await getWorkspaceInvitationById(invitationId);

	if (!invitation) {
		return {
			success: false,
			error: "Invitation not found.",
		};
	}

	if (invitation.workspaceId !== workspace.id) {
		return {
			success: false,
			error: "Invitation does not belong to this workspace.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false,
			error: "Only pending invitations can be revoked.",
		};
	}

	const updatedInvitation = await updateWorkspaceInvitation(invitationId, {
		status: "revoked",
	});

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "workspace_invitation",
		entityId: invitation.id,
		metadata: {
			email: invitation.email,
			status: "revoked",
		},
	});

	revalidatePath(`/workspaces/${workspace.slug}/settings/members`);

	return {
		success: true,
		data: updatedInvitation,
	};
}

export async function resendWorkspaceInvitationAction(
	workspaceSlug: string,
	invitationId: string,
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const invitation = await getWorkspaceInvitationById(invitationId);

	if (!invitation) {
		return {
			success: false,
			error: "Invitation not found.",
		};
	}

	if (invitation.workspaceId !== workspace.id) {
		return {
			success: false,
			error: "Invitation does not belong to this workspace.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false,
			error: "Only pending invitations can be revoked.",
		};
	}

	const newExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	const updatedInvitation = await updateWorkspaceInvitation(invitationId, {
		expiresAt: newExpiration,
	});

	await sendWorkspaceInvitationEmail({
		email: invitation.email,
		workspaceName: workspace.name,
		token: invitation.token,
	});

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "workspace_invitation",
		entityId: invitation.id,
		metadata: {
			email: invitation.email,
			action: "resent",
		},
	});

	revalidatePath(`/workspaces/${workspace.slug}/settings/members`);

	return {
		success: true,
		data: updatedInvitation,
	};
}

// Workspace Invitation Acceptance Action

export async function getWorkspaceInvitationByTokenAction(token: string) {
	const invitation = await getWorkspaceInvitationByToken(token);

	if (!invitation) {
		return {
			success: false as const,
			error: "Invitation not found.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false as const,
			error: "Invitation is no longer active.",
		};
	}

	if (isInvitationExpired(invitation.expiresAt)) {
		return {
			success: false as const,
			error: "Invitation has expired.",
		};
	}

	return {
		success: true as const,
		data: invitation,
	};
}

export async function acceptWorkspaceInvitationAction(token: string) {
	const user = await getCurrentUser();

	const invitation = await getWorkspaceInvitationByToken(token);

	if (!invitation) {
		return {
			success: false,
			error: "Invitation not found.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false,
			error: "Invitation is no longer active.",
		};
	}

	if (isInvitationExpired(invitation.expiresAt)) {
		return {
			success: false,
			error: "Invitation has expired.",
		};
	}

	if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
		return {
			success: false,
			error: "This invitation was sent to another email address.",
		};
	}

	const existingMember = await getWorkspaceMember(
		invitation.workspaceId,
		user.id,
	);

	if (existingMember) {
		return {
			success: false,
			error: "You are already a member of this workspace.",
		};
	}

	const member = await addWorkspaceMember({
		workspaceId: invitation.workspaceId,
		userId: user.id,
		role: invitation.role,
	});

	const workspace = await getWorkspaceById(invitation.workspaceId);

	const updatedInvitation = await updateWorkspaceInvitation(invitation.id, {
		status: "accepted",
	});

	await createActivity({
		workspaceId: invitation.workspaceId,
		actorId: user.id,
		action: "accepted",
		entity: "workspace_invitation",
		entityId: invitation.id,
		metadata: {
			email: invitation.email,
			role: invitation.role,
		},
	});

	return {
		success: true,
		data: {
			member,
			invitation: updatedInvitation,
			workspaceSlug: workspace?.slug,
		},
	};
}
