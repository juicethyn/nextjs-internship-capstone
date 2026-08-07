import { redirect } from "next/navigation";
import { getCommentById } from "./db/queries/comments";
import { getListById } from "./db/queries/lists";
import { getProjectMember } from "./db/queries/projectMembers";
import { getProjectBySlug } from "./db/queries/projects";
import { getTaskById } from "./db/queries/tasks";
import { getUserById } from "./db/queries/users";
import { getWorkspaceInvitationById } from "./db/queries/workspaceInvitations";
import { getWorkspaceMemberById } from "./db/queries/workspaceMembers";
import { getWorkspaceById, getWorkspaceBySlug } from "./db/queries/workspaces";

// Workspace Permissions

export async function requireWorkspaceBySlug(workspaceSlug: string) {
	const workspace = await getWorkspaceBySlug(workspaceSlug);

	if (!workspace) {
		redirect(`/onboarding`);
	}

	return workspace;
}

async function redirectToOwnWorkspace(userId: string): Promise<never> {
	const user = await getUserById(userId);

	if (!user?.lastWorkspaceId) {
		redirect("/onboarding");
	}

	const ownWorkspace = await getWorkspaceById(user.lastWorkspaceId);

	// lastWorkspaceId pointing at something deleted/nonexistent — don't trust it blindly
	if (!ownWorkspace) {
		redirect("/onboarding");
	}

	redirect(`/w/${ownWorkspace.slug}/dashboard`);
}

export async function requireWorkspaceMember(
	workspaceSlug: string,
	userId: string,
) {
	const workspace = await requireWorkspaceBySlug(workspaceSlug);

	const member = await getWorkspaceMemberById(workspace.id, userId);

	if (!member) {
		await redirectToOwnWorkspace(userId);
	}

	return workspace;
}

export async function requireWorkspaceAdmin(
	workspaceSlug: string,
	userId: string,
) {
	const workspace = await requireWorkspaceBySlug(workspaceSlug);

	const member = await getWorkspaceMemberById(workspace.id, userId);

	if (!member || (member.role !== "owner" && member.role !== "admin")) {
		redirect(`/w/${workspace.slug}/dashboard`);
	}

	return workspace;
}

export async function requireWorkspaceOwner(
	workspaceSlug: string,
	userId: string,
) {
	const workspace = await requireWorkspaceBySlug(workspaceSlug);

	const member = await getWorkspaceMemberById(workspace.id, userId);

	if (member?.role !== "owner") {
		redirect(`/w/${workspace.slug}/dashboard`);
	}

	return workspace;
}

// Projects Permissions

export async function requireProjectBySlug(
	workspaceSlug: string,
	projectSlug: string,
) {
	const workspace = await requireWorkspaceBySlug(workspaceSlug);

	const project = await getProjectBySlug(workspace.id, projectSlug);

	if (!project) {
		redirect(`/w/${workspace.slug}/dashboard`);
	}

	return project;
}

export async function requireProjectMember(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
) {
	const project = await requireProjectBySlug(workspaceSlug, projectSlug);

	const member = await getProjectMember(project.id, userId);

	if (!member) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	return project;
}

export async function requireProjectLead(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
) {
	const project = await requireProjectBySlug(workspaceSlug, projectSlug);

	if (project.leadId !== userId) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	return project;
}

export async function requireActiveProject(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
) {
	const project = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		userId,
	);

	if (project.isArchived) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	return project;
}

// Lists Permissions

export async function requireList(listId: string) {
	const list = await getListById(listId);

	if (!list) {
		redirect("/onboarding");
	}

	return list;
}

// Tasks Permissions

export async function requireTask(taskId: string) {
	const task = await getTaskById(taskId);

	if (!task) {
		redirect("/onboarding");
	}

	return task;
}

export async function requireTaskInProject(taskId: string, projectId: string) {
	const task = await requireTask(taskId);

	const list = await requireList(task.listId);

	if (list.projectId !== projectId) {
		throw new Error("Task does not belong to the specified project");
	}

	return task;
}

// Comments Permissions

export async function requireComment(commentId: string) {
	const comment = await getCommentById(commentId);

	if (!comment) {
		redirect("/onboarding");
	}

	return comment;
}

// Workspace Invitation Permissions

export async function requireWorkspaceInvitation(inviteId: string) {
	const invitation = await getWorkspaceInvitationById(inviteId);

	if (!invitation) {
		redirect("/onboarding");
	}

	return invitation;
}

export function isInvitationExpired(expiresAt: Date) {
	return expiresAt < new Date();
}
