"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { db } from "../db";
import { createDefaultLists } from "../db/queries/lists";
import { addProjectMember } from "../db/queries/projectMembers";
import {
	archiveProject,
	createProject,
	deleteProject,
	getProjectBySlugWithRelations,
	getProjectsByWorkspace,
	restoreProject,
	syncProjectCompletionStatus,
	updateProject,
} from "../db/queries/projects";
import { setProjectLabels } from "../db/queries/projectWorkspaceLabels";
import { getLabelsByWorkspace } from "../db/queries/workspaceLabels";
import {
	isProjectManager,
	requireActiveProject,
	requireProjectMember,
	requireWorkspaceMember,
} from "../permission";
import {
	type CreateProjectInput,
	createProjectSchema,
	type ProjectGeneralSettingsInput,
	projectGeneralSettingsSchema,
} from "../validations/project";

const FORBIDDEN_MESSAGE =
	"Only the project lead or a workspace owner/admin can manage this project.";

export async function getProjectsByWorkspaceBySlug(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const projects = await getProjectsByWorkspace(workspace.id);

	if (!projects) {
		return {
			success: false,
			message: "No projects found for this workspace",
		};
	}

	return {
		success: true,
		projects,
	};
}

export async function getProjectBySlug(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const { workspaceId } = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const project = await getProjectBySlugWithRelations(workspaceId, projectSlug);

	if (!project) {
		return {
			success: false,
			message: "Project not found",
		};
	}

	return {
		success: true,
		project,
	};
}

export async function createProjectAction(
	workspaceSlug: string,
	data: CreateProjectInput,
) {
	const user = await getCurrentUser();

	const validatedData = createProjectSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: "Invalid project data",
		};
	}

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	// labelIds is not a projects column — keep it out of the insert payload.
	const { labelIds, ...projectData } = validatedData.data;

	const project = await db.transaction(async (tx) => {
		const project = await createProject(workspace.id, user.id, projectData, tx);

		await addProjectMember(project.id, user.id, tx);
		await createDefaultLists(project.id, tx);

		if (labelIds.length > 0) {
			// labelIds comes from the client, so only attach labels that actually
			// belong to this workspace.
			const workspaceLabels = await getLabelsByWorkspace(workspace.id);

			const validLabelIds = labelIds.filter((labelId) =>
				workspaceLabels.some((label) => label.id === labelId),
			);

			await setProjectLabels(project.id, validLabelIds, tx);
		}

		return project;
	});

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

	revalidatePath(`/w/${workspaceSlug}/projects`);
	return { success: true, project, message: "Project created successfully!" };
}

export async function updateProjectAction(
	workspaceSlug: string,
	projectSlug: string,
	data: ProjectGeneralSettingsInput,
) {
	const user = await getCurrentUser();

	const validatedData = projectGeneralSettingsSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: treeifyError(validatedData.error),
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

	const updatedProject = await updateProject(project.id, {
		...validatedData.data,
		description: validatedData.data.description || null,
		startDate: validatedData.data.startDate ?? null,
		dueDate: validatedData.data.dueDate ?? null,
	});

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

	revalidatePath(`/w/${workspaceSlug}/projects`);
	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		project: updatedProject,
		message: "Project updated successfully!",
	};
}

export async function archiveProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
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
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects`);
	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		project: archivedProject,
		message: "Project archived.",
	};
}

export async function restoreProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	// Not requireActiveProject — the project being archived is the whole point.
	const project = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

	if (!project.isArchived) {
		return {
			success: false,
			message: "Project is not archived.",
		};
	}

	const restoredProject = await restoreProject(project.id);

	// restoreProject always writes "active"; re-derive so a fully-done project
	// comes back as completed.
	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "restored",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects`);
	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		project: restoredProject,
		message: "Project restored.",
	};
}

export async function deleteProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	// Archived projects must stay deletable.
	const project = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

	// Logged before the delete — the activity row references the workspace, and
	// lists/tasks/members cascade away with the project.
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

	revalidatePath(`/w/${workspaceSlug}/projects`);

	return {
		success: true,
		message: "Project deleted.",
	};
}
