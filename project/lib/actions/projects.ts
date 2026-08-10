"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { db } from "../db";
import { createDefaultLists } from "../db/queries/lists";
import { addProjectMember } from "../db/queries/projectMembers";
import {
	createProject,
	getProjectBySlugWithRelations,
	getProjectsByWorkspace,
} from "../db/queries/projects";
import { setProjectLabels } from "../db/queries/projectWorkspaceLabels";
import { getLabelsByWorkspace } from "../db/queries/workspaceLabels";
import { requireProjectMember, requireWorkspaceMember } from "../permission";
import {
	type CreateProjectInput,
	createProjectSchema,
} from "../validations/project";

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

// Not needed for now

// export async function updateProjectAction(
// 	workspaceSlug: string,
// 	projectSlug: string,
// 	data: UpdateProjectInput,
// ) {
// 	const user = await getCurrentUser();

// 	const validatedData = createProjectSchema.safeParse(data);

// 	if (!validatedData.success) {
// 		return {
// 			success: false,
// 			message: treeifyError(validatedData.error),
// 		};
// 	}

// 	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

// 	const updatedProject = await updateProject(project.id, validatedData.data);

// 	await createActivity({
// 		workspaceId: project.workspaceId,
// 		actorId: user.id,
// 		action: "updated",
// 		entity: "project",
// 		entityId: project.id,
// 		metadata: {
// 			name: updatedProject.name,
// 		},
// 	});

// 	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

// 	return { success: true, project: updatedProject };
// }

// export async function deleteProjectAction(
// 	workspaceSlug: string,
// 	projectSlug: string,
// ) {
// 	const user = await getCurrentUser();

// 	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

// 	await createActivity({
// 		workspaceId: project.workspaceId,
// 		actorId: user.id,
// 		action: "deleted",
// 		entity: "project",
// 		entityId: project.id,
// 		metadata: {
// 			name: project.name,
// 		},
// 	});

// 	await deleteProject(project.id);

// 	revalidatePath(`/workspaces/${workspaceSlug}`);

// 	return {
// 		success: true,
// 		message: "Project deleted successfully",
// 	};
// }

// export async function transferProjectLeadAction(
// 	workspaceSlug: string,
// 	projectSlug: string,
// 	newLeadId: string,
// ) {
// 	const user = await getCurrentUser();

// 	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

// 	const newLead = await getProjectMember(project.id, newLeadId);

// 	if (!newLead) {
// 		return {
// 			success: false,
// 			message: "User is not a member of the project",
// 		};
// 	}

// 	await transferProjectLead(project.id, newLeadId);

// 	await createActivity({
// 		workspaceId: project.workspaceId,
// 		actorId: user.id,
// 		action: "transferred",
// 		entity: "project",
// 		entityId: project.id,
// 		metadata: {
// 			previousLeadId: user.id,
// 			newLeadId,
// 		},
// 	});

// 	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

// 	return {
// 		success: true,
// 		message: "Project lead transferred successfully",
// 	};
// }

// export async function archiveProjectAction(
// 	workspaceSlug: string,
// 	projectSlug: string,
// ) {
// 	const user = await getCurrentUser();

// 	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

// 	if (project.isArchived) {
// 		return {
// 			success: false,
// 			message: "Project is already archived",
// 		};
// 	}

// 	const archivedProject = await archiveProject(project.id);

// 	await createActivity({
// 		workspaceId: project.workspaceId,
// 		actorId: user.id,
// 		action: "archived",
// 		entity: "project",
// 		entityId: project.id,
// 		metadata: {
// 			name: project.name,
// 			archived: true,
// 		},
// 	});

// 	revalidatePath(`/workspaces/${workspaceSlug}`);
// 	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

// 	return {
// 		success: true,
// 		data: archivedProject,
// 	};
// }

// export async function restoreProjectAction(
// 	workspaceSlug: string,
// 	projectSlug: string,
// ) {
// 	const user = await getCurrentUser();

// 	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

// 	if (!project.isArchived) {
// 		return {
// 			success: false,
// 			message: "Project is not archived",
// 		};
// 	}

// 	const restoredProject = await restoreProject(project.id);

// 	await createActivity({
// 		workspaceId: project.workspaceId,
// 		actorId: user.id,
// 		action: "restored",
// 		entity: "project",
// 		entityId: project.id,
// 		metadata: {
// 			name: project.name,
// 			archived: false,
// 		},
// 	});

// 	revalidatePath(`/workspaces/${workspaceSlug}`);
// 	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

// 	return {
// 		success: true,
// 		data: restoredProject,
// 	};
// }

// // export async function toggleProjectArchiveStatusAction(projectId: string, archived: boolean) {
// // 	return archived ? await archiveProject(projectId) : await restoreProject(projectId);
// // }
