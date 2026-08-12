import { getCommentById } from "./db/queries/comments";
import { getListById } from "./db/queries/lists";
import { getProjectMember } from "./db/queries/projectMembers";
import { getProjectBySlug } from "./db/queries/projects";
import { getTaskById } from "./db/queries/tasks";
import { getWorkspaceInvitationById } from "./db/queries/workspaceInvitations";
import { getWorkspaceMemberById } from "./db/queries/workspaceMembers";
import { getWorkspaceBySlug } from "./db/queries/workspaces";

// These guards report, they never navigate. A guard that redirects can only be
// used by a page; returning a result lets a server action turn the same check
// into a toast, which is why every caller here shares one implementation.
export type PermissionResult<T> =
	| { success: true; data: T }
	| {
			success: false;
			reason: "not-found" | "forbidden";
			message: string;
	  };

function forbidden(message: string) {
	return { success: false as const, reason: "forbidden" as const, message };
}

function notFound(message: string) {
	return { success: false as const, reason: "not-found" as const, message };
}

function granted<T>(data: T) {
	return { success: true as const, data };
}

export const FORBIDDEN_MESSAGES = {
	workspaceMember: "You are not a member of this workspace.",
	workspaceAdmin: "Only a workspace owner or admin can do this.",
	workspaceOwner: "Only the workspace owner can do this.",
	projectMember: "You do not have access to this project.",
	projectManager:
		"Only the project lead or a workspace owner/admin can manage this project.",
	archivedProject: "This project is archived. Restore it to make changes.",
} as const;

// Workspace Permissions

export async function requireWorkspaceBySlug(workspaceSlug: string) {
	const workspace = await getWorkspaceBySlug(workspaceSlug);

	if (!workspace) {
		return notFound("Workspace not found.");
	}

	return granted(workspace);
}

export async function requireWorkspaceMember(
	workspaceSlug: string,
	userId: string,
) {
	const result = await requireWorkspaceBySlug(workspaceSlug);

	if (!result.success) return result;

	const member = await getWorkspaceMemberById(result.data.id, userId);

	if (!member) {
		return forbidden(FORBIDDEN_MESSAGES.workspaceMember);
	}

	return granted(result.data);
}

export async function requireWorkspaceAdmin(
	workspaceSlug: string,
	userId: string,
) {
	const result = await requireWorkspaceBySlug(workspaceSlug);

	if (!result.success) return result;

	const member = await getWorkspaceMemberById(result.data.id, userId);

	if (!member || (member.role !== "owner" && member.role !== "admin")) {
		return forbidden(FORBIDDEN_MESSAGES.workspaceAdmin);
	}

	return granted(result.data);
}

export async function requireWorkspaceOwner(
	workspaceSlug: string,
	userId: string,
) {
	const result = await requireWorkspaceBySlug(workspaceSlug);

	if (!result.success) return result;

	const member = await getWorkspaceMemberById(result.data.id, userId);

	if (member?.role !== "owner") {
		return forbidden(FORBIDDEN_MESSAGES.workspaceOwner);
	}

	return granted(result.data);
}

// Not an authorization check on the caller — used to validate that a task's
// assignee belongs to the workspace before writing the row.
export async function isWorkspaceMember(workspaceId: string, userId: string) {
	const member = await getWorkspaceMemberById(workspaceId, userId);

	return Boolean(member);
}

// Projects Permissions

export async function requireProjectBySlug(
	workspaceSlug: string,
	projectSlug: string,
) {
	const result = await requireWorkspaceBySlug(workspaceSlug);

	if (!result.success) return result;

	const project = await getProjectBySlug(result.data.id, projectSlug);

	if (!project) {
		return notFound("Project not found.");
	}

	return granted(project);
}

// Returns canManage alongside the project: deciding access already loaded the
// workspace member row, so callers that also need the manage flag get it
// without a second lookup.
export async function requireProjectMember(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
) {
	const result = await requireProjectBySlug(workspaceSlug, projectSlug);

	if (!result.success) return result;

	const project = result.data;

	const [projectMember, workspaceMember] = await Promise.all([
		getProjectMember(project.id, userId),
		getWorkspaceMemberById(project.workspaceId, userId),
	]);

	const isWorkspaceManager =
		workspaceMember?.role === "owner" || workspaceMember?.role === "admin";

	// Workspace owners/admins oversee every project in their workspace, so they
	// have access without an explicit project_members row.
	if (!projectMember && !isWorkspaceManager) {
		return forbidden(FORBIDDEN_MESSAGES.projectMember);
	}

	return granted({
		project,
		canManage: project.leadId === userId || isWorkspaceManager,
	});
}

export async function requireActiveProject(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
) {
	const result = await requireProjectMember(workspaceSlug, projectSlug, userId);

	if (!result.success) return result;

	if (result.data.project.isArchived) {
		return forbidden(FORBIDDEN_MESSAGES.archivedProject);
	}

	return result;
}

// Lists Permissions

export async function requireList(listId: string) {
	const list = await getListById(listId);

	if (!list) {
		return notFound("This list no longer exists.");
	}

	return granted(list);
}

// Tasks Permissions

export async function requireTask(taskId: string) {
	const task = await getTaskById(taskId);

	if (!task) {
		return notFound("This task no longer exists.");
	}

	return granted(task);
}

// A task sitting in another project is a bug, not something a user can cause.
export async function requireTaskInProject(taskId: string, projectId: string) {
	const taskResult = await requireTask(taskId);

	if (!taskResult.success) return taskResult;

	const listResult = await requireList(taskResult.data.listId);

	if (!listResult.success) return listResult;

	if (listResult.data.projectId !== projectId) {
		throw new Error("Task does not belong to the specified project");
	}

	return taskResult;
}

// Comments Permissions

export async function requireComment(commentId: string) {
	const comment = await getCommentById(commentId);

	if (!comment) {
		return notFound("This comment no longer exists.");
	}

	return granted(comment);
}

// Workspace Invitation Permissions

export async function requireWorkspaceInvitation(inviteId: string) {
	const invitation = await getWorkspaceInvitationById(inviteId);

	if (!invitation) {
		return notFound("Invitation not found.");
	}

	return granted(invitation);
}

export function isInvitationExpired(expiresAt: Date) {
	return expiresAt < new Date();
}
