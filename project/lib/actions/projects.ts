"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	addProjectMember,
	getProjectMemberByUserId,
} from "../db/queries/projectMembers";
import {
	archiveProject,
	createProject,
	deleteProject,
	restoreProject,
	transferProjectLead,
	updateProject,
} from "../db/queries/projects";
import {
	requireProjectLead,
	requireWorkspaceMember,
	requireWorkspaceOwner,
} from "../permission";
import {
	type CreateProjectInput,
	createProjectSchema,
	type UpdateProjectInput,
} from "../validations/project";

export async function createProjectAction(
	workspaceSlug: string,
	data: CreateProjectInput,
) {
	const user = await getCurrentUser();

	const validatedData = createProjectSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: treeifyError(validatedData.error),
		};
	}

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const project = await createProject(
		workspace.id,
		user.id,
		validatedData.data,
	);

	await addProjectMember(project.id, user.id);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "created",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}`);

	return { success: true, project };
}

export async function updateProjectAction(
	workspaceSlug: string,
	projectSlug: string,
	data: UpdateProjectInput,
) {
	const user = await getCurrentUser();

	const validatedData = createProjectSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: treeifyError(validatedData.error),
		};
	}

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	const updatedProject = await updateProject(project.id, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "updated",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: updatedProject.name,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return { success: true, project: updatedProject };
}

export async function deleteProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "deleted",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
		},
	});

	await deleteProject(project.id);

	revalidatePath(`/workspaces/${workspaceSlug}`);

	return {
		success: true,
		message: "Project deleted successfully",
	};
}

export async function transferProjectLeadAction(
	workspaceSlug: string,
	projectSlug: string,
	newLeadId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	const newLead = await getProjectMemberByUserId(project.id, newLeadId);

	if (!newLead) {
		return {
			success: false,
			message: "User is not a member of the project",
		};
	}

	await transferProjectLead(project.id, newLeadId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "transferred",
		entity: "project",
		entityId: project.id,
		metadata: {
			previousLeadId: user.id,
			newLeadId,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true,
		message: "Project lead transferred successfully",
	};
}

export async function archiveProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	if (project.isArchived) {
		return {
			success: false,
			message: "Project is already archived",
		};
	}

	const archivedProject = await archiveProject(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "archived",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
			archived: true,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}`);
	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true,
		data: archivedProject,
	};
}

export async function restoreProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	if (!project.isArchived) {
		return {
			success: false,
			message: "Project is not archived",
		};
	}

	const restoredProject = await restoreProject(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "restored",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
			archived: false,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}`);
	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true,
		data: restoredProject,
	};
}

// export async function toggleProjectArchiveStatusAction(projectId: string, archived: boolean) {
// 	return archived ? await archiveProject(projectId) : await restoreProject(projectId);
// }
