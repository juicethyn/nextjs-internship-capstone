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
	updateWorkspaceInvitation,
} from "../db/queries/workspaceInvitations";
import {
	addWorkspaceMember,
	getWorkspaceMemberById,
} from "../db/queries/workspaceMembers";
import { getWorkspaceById } from "../db/queries/workspaces";
import { sendWorkspaceInvitationEmail } from "../email/send-workspace-invitation";
import { isInvitationExpired, requireWorkspaceAdmin } from "../permission";
import {
	type CreateWorkspaceInvitationInput,
	createWorkspaceInvitationSchema,
} from "../validations/workspaceInvitation";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Workspace Invitation Actions

// Resolves an email before it is staged in the invite dialog, so a duplicate or an existing member is rejected at Add time rather than after Send.
export async function findWorkspaceInviteeByEmailAction(
	workspaceSlug: string,
	email: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const normalizedEmail = email.trim().toLowerCase();

	if (normalizedEmail === user.email.toLowerCase()) {
		return {
			success: false as const,
			message: "You are already a member of this workspace.",
		};
	}

	const existingUser = await getUserByEmail(normalizedEmail);

	if (existingUser) {
		const existingMember = await getWorkspaceMemberById(
			workspace.id,
			existingUser.id,
		);

		if (existingMember) {
			return {
				success: false as const,
				message: "This person is already a member of this workspace.",
			};
		}
	}

	const existingInvitation = await getWorkspaceInvitationByEmail(
		workspace.id,
		normalizedEmail,
	);

	if (existingInvitation) {
		return {
			success: false as const,
			message: "An invitation is already pending for this email.",
		};
	}

	return {
		success: true as const,
		data: {
			email: normalizedEmail,
			// The invitee may not be a registered user yet, so the user object is null if they don't exist.
			user: existingUser
				? {
						firstName: existingUser.firstName,
						lastName: existingUser.lastName,
						email: existingUser.email,
						imageUrl: existingUser.imageUrl,
					}
				: null,
		},
	};
}

// Batches workspace invitations, creating a row for each invite and sending an email. Returns a list of results for each invite, including any errors that occurred.
export async function createWorkspaceInvitationsAction(
	workspaceSlug: string,
	invites: CreateWorkspaceInvitationInput[],
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return {
			success: false as const,
			message: access.message,
			sentCount: 0,
			results: [] as { email: string; success: boolean; error?: string }[],
		};
	}

	const workspace = access.data;

	const results: { email: string; success: boolean; error?: string }[] = [];

	for (const invite of invites) {
		const validatedData = createWorkspaceInvitationSchema.safeParse({
			...invite,
			email: invite.email.trim().toLowerCase(),
		});

		if (!validatedData.success) {
			results.push({
				email: invite.email,
				success: false,
				error: "Invalid email address.",
			});
			continue;
		}

		const { email, role } = validatedData.data;

		const existingUser = await getUserByEmail(email);

		if (existingUser) {
			const existingMember = await getWorkspaceMemberById(
				workspace.id,
				existingUser.id,
			);

			if (existingMember) {
				results.push({
					email,
					success: false,
					error: "Already a member of this workspace.",
				});
				continue;
			}
		}

		const existingInvitation = await getWorkspaceInvitationByEmail(
			workspace.id,
			email,
		);

		if (existingInvitation) {
			results.push({
				email,
				success: false,
				error: "An invitation is already pending.",
			});
			continue;
		}

		const invitation = await createWorkspaceInvitation({
			email,
			role,
			workspaceId: workspace.id,
			invitedById: user.id,
			token: nanoid(32),
			expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
		});

		const emailResult = await sendWorkspaceInvitationEmail({
			email: invitation.email,
			workspaceName: workspace.name,
			token: invitation.token,
		});

		// The row is what makes the invite acceptable via its token link, so a
		// bounced email is logged rather than treated as a failed invite.
		if (!emailResult.success) {
			console.warn(`Failed to send invitation email to ${invitation.email}`);
		}

		await createActivity({
			workspaceId: workspace.id,
			actorId: user.id,
			action: "invited",
			entity: "workspace_invitation",
			entityId: invitation.id,
			metadata: {
				email: invitation.email,
				role: invitation.role,
			},
		});

		results.push({ email, success: true });
	}

	const sentCount = results.filter((result) => result.success).length;

	if (sentCount > 0) {
		revalidatePath(`/w/${workspace.slug}/members`);
	}

	return {
		success: sentCount > 0,
		sentCount,
		results,
	};
}

export async function revokeWorkspaceInvitationAction(
	workspaceSlug: string,
	invitationId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const invitation = await getWorkspaceInvitationById(invitationId);

	if (!invitation) {
		return {
			success: false as const,
			message: "Invitation not found.",
		};
	}

	if (invitation.workspaceId !== workspace.id) {
		return {
			success: false as const,
			message: "Invitation does not belong to this workspace.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false as const,
			message: "Only pending invitations can be revoked.",
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

	revalidatePath(`/w/${workspace.slug}/members`);

	return {
		success: true as const,
		data: updatedInvitation,
	};
}

export async function resendWorkspaceInvitationAction(
	workspaceSlug: string,
	invitationId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const invitation = await getWorkspaceInvitationById(invitationId);

	if (!invitation) {
		return {
			success: false as const,
			message: "Invitation not found.",
		};
	}

	if (invitation.workspaceId !== workspace.id) {
		return {
			success: false as const,
			message: "Invitation does not belong to this workspace.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false as const,
			message: "Only pending invitations can be revoked.",
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

	revalidatePath(`/w/${workspace.slug}/members`);

	return {
		success: true as const,
		data: updatedInvitation,
	};
}

// Workspace Invitation Acceptance Action

export async function getWorkspaceInvitationByTokenAction(token: string) {
	const invitation = await getWorkspaceInvitationByToken(token);

	if (!invitation) {
		return {
			success: false as const,
			message: "Invitation not found.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false as const,
			message: "Invitation is no longer active.",
		};
	}

	if (isInvitationExpired(invitation.expiresAt)) {
		return {
			success: false as const,
			message: "Invitation has expired.",
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
			success: false as const,
			message: "Invitation not found.",
		};
	}

	if (invitation.status !== "pending") {
		return {
			success: false as const,
			message: "Invitation is no longer active.",
		};
	}

	if (isInvitationExpired(invitation.expiresAt)) {
		return {
			success: false as const,
			message: "Invitation has expired.",
		};
	}

	if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
		return {
			success: false as const,
			message: "This invitation was sent to another email address.",
		};
	}

	const existingMember = await getWorkspaceMemberById(
		invitation.workspaceId,
		user.id,
	);

	if (existingMember) {
		return {
			success: false as const,
			message: "You are already a member of this workspace.",
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
		success: true as const,
		data: {
			member,
			invitation: updatedInvitation,
			workspaceSlug: workspace?.slug,
		},
	};
}
