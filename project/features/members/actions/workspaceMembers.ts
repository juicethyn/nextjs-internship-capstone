"use server";

import { revalidatePath } from "next/cache";
import {
	canManageWorkspaceMember,
	WORKSPACE_MEMBER_FORBIDDEN_MESSAGE,
} from "@/features/members/lib/member-permissions";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { removeUserFromWorkspaceProjects } from "@/lib/db/queries/projectMembers";
import { getWorkspaceProjectAssignments } from "@/lib/db/queries/projects";
import { getUsersByEmails } from "@/lib/db/queries/users";
import { getPendingWorkspaceInvitations } from "@/lib/db/queries/workspaceInvitations";
import {
	getWorkspaceMembersById,
	getWorkspacePresence,
	removeWorkspaceMember,
	touchWorkspaceMemberPresence,
	updateWorkspaceMemberRole,
} from "@/lib/db/queries/workspaceMembers";
import { requireWorkspaceMember } from "@/lib/permission";
import { memberDisplayName } from "@/lib/user-display";

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

// Fired once a minute per active user, so it deliberately skips the usual
// permission round trip — touchWorkspaceMemberPresence scopes the write by slug
// and updates nothing for a non-member. A stale tab beating after someone is
// removed is expected, not an error worth surfacing.
export async function heartbeatWorkspacePresenceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const touched = await touchWorkspaceMemberPresence(workspaceSlug, user.id);

	return { success: true as const, data: { active: touched.length > 0 } };
}

export async function getWorkspacePresenceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const presence = await getWorkspacePresence(access.data.id);

	return { success: true as const, data: presence };
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

	const [members, assignments] = await Promise.all([
		getWorkspaceMembersById(workspace.id),
		getWorkspaceProjectAssignments(workspace.id),
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
				projectCount: assignments.counts[member.userId] ?? 0,
				// Drives the kick dialog's blocked state without a per-click fetch.
				ledProjects: assignments.ledProjects[member.userId] ?? [],
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

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	// Ownership moves through transferWorkspaceOwnership, never a role edit.
	if (role !== "admin" && role !== "member") {
		return {
			success: false as const,
			message: "Members can only be set to admin or member.",
		};
	}

	const members = await getWorkspaceMembersById(workspace.id);

	const viewer = members.find((member) => member.userId === user.id);
	const target = members.find((member) => member.userId === userId);

	if (!target) {
		return {
			success: false as const,
			message: "User is not a member of this workspace.",
		};
	}

	if (
		!viewer ||
		!canManageWorkspaceMember(
			viewer.role,
			target.role,
			target.userId === user.id,
		)
	) {
		return {
			success: false as const,
			message: WORKSPACE_MEMBER_FORBIDDEN_MESSAGE,
		};
	}

	if (target.role === role) {
		return {
			success: false as const,
			message: `${memberDisplayName(target.user)} is already ${role === "admin" ? "an admin" : "a member"}.`,
		};
	}

	const member = await updateWorkspaceMemberRole(workspace.id, userId, role);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "workspace_member",
		entityId: target.id,
		metadata: {
			userId: target.userId,
			previousRole: target.role,
			role,
		},
	});

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true as const,
		data: member,
		message: `${memberDisplayName(target.user)} is now ${role === "admin" ? "an admin" : "a member"}.`,
	};
}

export async function removeWorkspaceMemberAction(
	workspaceSlug: string,
	memberId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const members = await getWorkspaceMembersById(workspace.id);

	const viewer = members.find((member) => member.userId === user.id);
	const target = members.find((member) => member.id === memberId);

	if (!target) {
		return {
			success: false as const,
			message: "User is not a member of this workspace.",
		};
	}

	if (
		!viewer ||
		!canManageWorkspaceMember(
			viewer.role,
			target.role,
			target.userId === user.id,
		)
	) {
		return {
			success: false as const,
			message: WORKSPACE_MEMBER_FORBIDDEN_MESSAGE,
		};
	}

	// Re-checked here rather than trusted from the client: the page's ledProjects
	// is a UI hint that can be stale if a lead moved in another tab.
	const { ledProjects } = await getWorkspaceProjectAssignments(workspace.id);

	const led = ledProjects[target.userId] ?? [];

	if (led.length > 0) {
		return {
			success: false as const,
			message: `${memberDisplayName(target.user)} leads ${led.length === 1 ? "a project" : `${led.length} projects`}. Transfer the project lead role before removing them.`,
			ledProjects: led,
		};
	}

	const removed = await db.transaction(async (tx) => {
		await removeUserFromWorkspaceProjects(workspace.id, target.userId, tx);

		return removeWorkspaceMember(workspace.id, target.userId, tx);
	});

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "deleted",
		entity: "workspace_member",
		entityId: target.id,
		metadata: {
			userId: target.userId,
			role: target.role,
		},
	});

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true as const,
		data: removed,
		message: `${memberDisplayName(target.user)} was removed from the workspace.`,
	};
}
