"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import {
	addWorkspaceMember,
	getWorkspaceMemberById,
	getWorkspaceMembersById,
	removeWorkspaceMember,
	updateWorkspaceMemberRole,
} from "../db/queries/workspaceMembers";
import {
	requireWorkspaceAdmin,
	requireWorkspaceMember,
	requireWorkspaceOwner,
} from "../permission";

export async function addWorkspaceMemberAction(
	workspaceSlug: string,
	userId: string,
	role: "admin" | "member",
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const existingMember = await getWorkspaceMemberById(workspace.id, userId);

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

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true,
		data: member,
	};
}

export async function getWorkspaceMembersBySlug(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const members = await getWorkspaceMembersById(workspace.id);

	return {
		success: true,
		data: members,
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

	revalidatePath(`/w/${workspace.slug}`, "layout");

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

	const members = await getWorkspaceMembersById(workspace.id);

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

	const removed = await removeWorkspaceMember(
		workspace.id,
		targetMember.userId,
	);

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true,
		data: removed,
	};
}
