"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import {
	createTaskLabel,
	deleteTaskLabel,
	getTaskLabelById,
	getTaskLabelsByProject,
	updateTaskLabel,
} from "@/lib/db/queries/taskLabels";

import { requireActiveProject } from "@/lib/permission";
import {
	type CreateTaskLabelInput,
	createTaskLabelSchema,
	type UpdateTaskLabelInput,
	updateTaskLabelSchema,
} from "@/lib/validations/label";

export async function getTaskLabelsByProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const labels = await getTaskLabelsByProject(project.id);

	return labels;
}

export async function createTaskLabelAction(
	workspaceSlug: string,
	projectSlug: string,
	data: CreateTaskLabelInput,
) {
	const user = await getCurrentUser();

	const validatedData = createTaskLabelSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid task label data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	// unique(projectId, name) is enforced in Postgres — check first so a repeat
	// name reads as a message instead of a constraint violation.
	const existingLabels = await getTaskLabelsByProject(project.id);

	const nameTaken = existingLabels.some(
		(existing) =>
			existing.name.toLowerCase() ===
			validatedData.data.name.trim().toLowerCase(),
	);

	if (nameTaken) {
		return {
			success: false,
			error: "A label with that name already exists.",
		};
	}

	const label = await createTaskLabel(project.id, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "created",
		entity: "task_label",
		entityId: label.id,
		metadata: {
			name: label.name,
			projectId: project.id,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: label,
	};
}

export async function updateTaskLabelAction(
	workspaceSlug: string,
	projectSlug: string,
	labelId: string,
	data: UpdateTaskLabelInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateTaskLabelSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid task label data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const label = await getTaskLabelById(labelId);

	if (!label || label.projectId !== project.id) {
		return {
			success: false,
			error: "Task label not found.",
		};
	}

	const updatedLabel = await updateTaskLabel(labelId, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "updated",
		entity: "task_label",
		entityId: label.id,
		metadata: {
			name: updatedLabel.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: updatedLabel,
	};
}

export async function deleteTaskLabelAction(
	workspaceSlug: string,
	projectSlug: string,
	labelId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const label = await getTaskLabelById(labelId);

	if (!label || label.projectId !== project.id) {
		return {
			success: false,
			error: "Task label not found.",
		};
	}

	const deletedLabel = await deleteTaskLabel(labelId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "deleted",
		entity: "task_label",
		entityId: label.id,
		metadata: {
			name: label.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: deletedLabel,
	};
}
