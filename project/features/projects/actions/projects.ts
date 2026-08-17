"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createDefaultLists } from "@/lib/db/queries/lists";
import { addProjectMember } from "@/lib/db/queries/projectMembers";
import {
	archiveProject,
	createProject,
	deleteProject,
	getProjectBySlugWithRelations,
	getProjectsByWorkspace,
	getVisibleProjectIds,
	restoreProject,
	syncProjectCompletionStatus,
	updateProject,
} from "@/lib/db/queries/projects";
import { setProjectLabels } from "@/lib/db/queries/projectWorkspaceLabels";
import { getLabelsByWorkspace } from "@/lib/db/queries/workspaceLabels";
import {
	FORBIDDEN_MESSAGES,
	requireActiveProject,
	requireProjectMember,
	requireWorkspaceMember,
} from "@/lib/permission";
import {
	type CreateProjectInput,
	createProjectSchema,
	type ProjectGeneralSettingsInput,
	projectGeneralSettingsSchema,
} from "@/lib/validations/project";

export async function getProjectsByWorkspaceBySlug(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const viewerRole =
		access.data.members.find((member) => member.userId === user.id)?.role ??
		"member";

	const isWorkspaceManager = viewerRole === "owner" || viewerRole === "admin";

	const visibleProjectIds = isWorkspaceManager
		? undefined
		: await getVisibleProjectIds(access.data.id, user.id, false);

	const projects = await getProjectsByWorkspace(
		access.data.id,
		visibleProjectIds,
	);

	return {
		success: true as const,
		data: projects,
	};
}

export async function getProjectBySlug(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const access = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	// The guard returns a bare row; the board needs lists, tasks and members.
	const project = await getProjectBySlugWithRelations(
		access.data.project.workspaceId,
		projectSlug,
	);

	if (!project) {
		return { success: false as const, message: "Project not found." };
	}

	return {
		success: true as const,
		data: { project, canManage: access.data.canManage },
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
			success: false as const,
			message: "Invalid project data",
		};
	}

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

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
		projectId: project.id,
		action: "created",
		entity: "project",
		entityId: project.id,
		metadata: {
			name: project.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects`);
	return {
		success: true as const,
		project,
		message: "Project created successfully!",
	};
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
			success: false as const,
			message: treeifyError(validatedData.error),
		};
	}

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
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
		projectId: project.id,
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
		success: true as const,
		project: updatedProject,
		message: "Project updated successfully!",
	};
}

export async function archiveProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	const archivedProject = await archiveProject(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
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
		success: true as const,
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
	const access = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	if (!project.isArchived) {
		return {
			success: false as const,
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
		projectId: project.id,
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
		success: true as const,
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
	const access = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	// Logged before the delete — the activity row references the workspace, and
	// lists/tasks/members cascade away with the project.
	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
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
		success: true as const,
		message: "Project deleted.",
	};
}
