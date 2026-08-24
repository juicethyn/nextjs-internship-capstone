"use server";

import { getCurrentUser } from "@/lib/auth";
import { getTaskActivity } from "@/lib/db/queries/activityLogs";
import {
	requireList,
	requireProjectMember,
	requireTask,
} from "@/lib/permission";

export async function getTaskActivityAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
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

	if (listResult.data.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const entries = await getTaskActivity(taskId);

	return {
		success: true as const,
		data: entries.reverse(),
	};
}
