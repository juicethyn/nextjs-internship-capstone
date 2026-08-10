"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth";
import {
	addLabelToTask,
	removeLabelFromTask,
} from "../db/queries/taskLabelAssignments";
import { getTaskLabelById } from "../db/queries/taskLabels";
import { requireActiveProject, requireList, requireTask } from "../permission";

export async function addTaskLabelToTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	taskLabelId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await requireList(task.listId);

	if (!list || list.projectId !== project.id) {
		return {
			success: false,
			error: "Task does not belong to the project.",
		};
	}

	const label = await getTaskLabelById(taskLabelId);

	if (!label || label.projectId !== project.id) {
		return {
			success: false,
			error: "Task label does not belong to the project.",
		};
	}

	const assignment = await addLabelToTask(task.id, label.id);

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: assignment,
	};
}

export async function removeTaskLabelFromTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	taskLabelId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await requireList(task.listId);

	if (!list || list.projectId !== project.id) {
		return {
			success: false,
			error: "Task does not belong to the project.",
		};
	}

	const removed = await removeLabelFromTask(task.id, taskLabelId);

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: removed,
	};
}
