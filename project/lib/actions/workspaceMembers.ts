import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import {
	addWorkspaceMember,
	getWorkspaceMember,
	getWorkspaceMembers,
	removeWorkspaceMember,
	updateWorkspaceMemberRole,
} from "../db/queries/workspaceMembers";
import {
	requireWorkspaceAdmin,
	requireWorkspaceMember,
	requireWorkspaceOwner,
} from "../permission";

export async function getWorkspaceMembersAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const member = await getWorkspaceMember(workspace.id, user.id);

	if (!member) {
		return {
			success: false,
			error: "You are not a member of this workspace.",
		};
	}

	return member;
}

export async function addWorkspaceMemberAction(
	workspaceSlug: string,
	userId: string,
	role: "admin" | "member",
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const existingMember = await getWorkspaceMember(workspace.id, userId);

	if (existingMember) {
		return {
			success: false,
			error: "User is already a member of this workspace.",
		};
	}

	const member = await addWorkspaceMember({
		workspaceId: workspace.id,
		userId,
		role,
	});

	revalidatePath(`/workspaces/${workspace.slug}`);

	return {
		success: true,
		data: member,
	};
}

export async function updateWorkspaceMemberRoleAction(
	workspaceSlug: string,
	userId: string,
	role: "admin" | "member",
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceOwner(workspaceSlug, user.id);

	const member = await updateWorkspaceMemberRole(workspace.id, userId, role);

	if (!member) {
		return {
			success: false,
			error: "User is not a member of this workspace.",
		};
	}

	revalidatePath(`/workspaces/${workspace.slug}`);

	return {
		success: true,
		data: member,
	};
}

export async function removeWorkspaceMemberAction(
	workspaceSlug: string,
	memberId: string,
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const members = await getWorkspaceMembers(workspace.id);

	const targetMember = members.find((member) => member.id === memberId);

	if (!targetMember) {
		return {
			success: false,
			error: "User is not a member of this workspace.",
		};
	}

	if (targetMember.role === "owner") {
		return {
			success: false,
			error: "Cannot remove the owner of the workspace.",
		};
	}

	const removed = await removeWorkspaceMember(workspace.id, memberId);

	revalidatePath(`/workspaces/${workspace.slug}`);

	return {
		success: true,
		data: removed,
	};
}
