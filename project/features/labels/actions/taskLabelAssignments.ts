"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
	addLabelToTask,
	removeLabelFromTask,
} from "@/lib/db/queries/taskLabelAssignments";
import { getTaskLabelById } from "@/lib/db/queries/taskLabels";
import {
	requireActiveProject,
	requireList,
	requireTask,
} from "@/lib/permission";

export async function addTaskLabelToTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	taskLabelId: string,
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

	const { project } = access.data;

	const taskResult = await requireTask(taskId);

	if (!taskResult.success) {
		return { success: false as const, message: taskResult.message };
	}

	const task = taskResult.data;

	const listResult = await requireList(task.listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (!list || list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const label = await getTaskLabelById(taskLabelId);

	if (!label || label.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task label does not belong to the project.",
		};
	}

	const assignment = await addLabelToTask(task.id, label.id);

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
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

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project } = access.data;

	const taskResult = await requireTask(taskId);

	if (!taskResult.success) {
		return { success: false as const, message: taskResult.message };
	}

	const task = taskResult.data;

	const listResult = await requireList(task.listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (!list || list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const removed = await removeLabelFromTask(task.id, taskLabelId);

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: removed,
	};
}
