"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import { getWorkspaceProjectAssignmentCounts } from "../db/queries/projects";
import { getUsersByEmails } from "../db/queries/users";
import { getPendingWorkspaceInvitations } from "../db/queries/workspaceInvitations";
import {
	getWorkspaceMembersById,
	removeWorkspaceMember,
	updateWorkspaceMemberRole,
} from "../db/queries/workspaceMembers";
import {
	requireWorkspaceAdmin,
	requireWorkspaceMember,
	requireWorkspaceOwner,
} from "../permission";

export async function getWorkspaceMembersBySlug(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const members = await getWorkspaceMembersById(workspace.id);

	return {
		success: true as const,
		data: members,
	};
}

export async function getWorkspaceMembersWithStatsBySlug(
	workspaceSlug: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const [members, projectCounts] = await Promise.all([
		getWorkspaceMembersById(workspace.id),
		getWorkspaceProjectAssignmentCounts(workspace.id),
	]);

	const viewerRole =
		members.find((member) => member.userId === user.id)?.role ?? "member";

	const canManage = viewerRole === "owner" || viewerRole === "admin";

	// Pending invitations are admin-only information — a plain member gets an
	// empty list rather than a hidden section they could read off the payload.
	const pendingInvitations = canManage
		? await getPendingInvitationsWithUsers(workspace.id)
		: [];

	return {
		success: true as const,
		data: {
			currentUserId: user.id,
			workspaceName: workspace.name,
			viewerRole,
			pendingInvitations,
			members: members.map((member) => ({
				...member,
				projectCount: projectCounts[member.userId] ?? 0,
			})),
		},
	};
}

async function getPendingInvitationsWithUsers(workspaceId: string) {
	const invitations = await getPendingWorkspaceInvitations(workspaceId);

	if (invitations.length === 0) return [];

	const users = await getUsersByEmails(
		invitations.map((invitation) => invitation.email),
	);

	const usersByEmail = new Map(users.map((user) => [user.email, user]));

	return invitations.map((invitation) => {
		const user = usersByEmail.get(invitation.email);

		return {
			...invitation,
			user: user
				? {
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						imageUrl: user.imageUrl,
						occupation: user.occupation,
					}
				: null,
		};
	});
}

export async function updateWorkspaceMemberRoleAction(
	workspaceSlug: string,
	userId: string,
	role: "admin" | "member",
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceOwner(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const member = await updateWorkspaceMemberRole(workspace.id, userId, role);

	if (!member) {
		return {
			success: false as const,
			message: "User is not a member of this workspace.",
		};
	}

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true as const,
		data: member,
	};
}

export async function removeWorkspaceMemberAction(
	workspaceSlug: string,
	memberId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const members = await getWorkspaceMembersById(workspace.id);

	const targetMember = members.find((member) => member.id === memberId);

	if (!targetMember) {
		return {
			success: false as const,
			message: "User is not a member of this workspace.",
		};
	}

	if (targetMember.role === "owner") {
		return {
			success: false as const,
			message: "Cannot remove the owner of the workspace.",
		};
	}

	const removed = await removeWorkspaceMember(
		workspace.id,
		targetMember.userId,
	);

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true as const,
		data: removed,
	};
}
