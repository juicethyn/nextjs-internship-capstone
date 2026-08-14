"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import { syncProjectCompletionStatus } from "@/lib/db/queries/projects";
import {
	createTask,
	deleteTask,
	rebalanceTaskPositionsIfNeeded,
	updateTask,
	updateTaskPosition,
} from "@/lib/db/queries/tasks";
import {
	isWorkspaceMember,
	requireActiveProject,
	requireList,
	requireTask,
} from "@/lib/permission";
import {
	type CreateTaskInput,
	createTaskSchema,
	type UpdateTaskInput,
	updateTaskSchema,
} from "@/lib/validations/task";

export async function createTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
	data: CreateTaskInput,
) {
	const user = await getCurrentUser();

	const validatedData = createTaskSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid task data.",
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

	const { project } = access.data;

	const listResult = await requireList(listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "List does not belong to the project.",
		};
	}

	if (validatedData.data.assigneeId) {
		const assigneeIsMember = await isWorkspaceMember(
			project.workspaceId,
			validatedData.data.assigneeId,
		);

		if (!assigneeIsMember) {
			return {
				success: false as const,
				message: "Assignee is not a member of this workspace.",
			};
		}
	}

	const task = await createTask(listId, user.id, validatedData.data);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: "created",
		entity: "task",
		entityId: task.id,
		metadata: {
			title: task.title,
			listId: list.id,
			listName: list.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: task,
	};
}

export async function updateTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	data: UpdateTaskInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateTaskSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid task data.",
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

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	if (validatedData.data.assigneeId) {
		const assigneeIsMember = await isWorkspaceMember(
			project.workspaceId,
			validatedData.data.assigneeId,
		);

		if (!assigneeIsMember) {
			return {
				success: false as const,
				message: "Assignee is not a member of this workspace.",
			};
		}
	}

	const updatedTask = await updateTask(task.id, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: "updated",
		entity: "task",
		entityId: task.id,
		metadata: {
			title: updatedTask.title,
			listId: list.id,
			listName: list.name,
			previousTitle: task.title,
			newTitle: updatedTask.title,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: updatedTask,
	};
}

export async function deleteTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
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

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const deletedTask = await deleteTask(taskId);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: "deleted",
		entity: "task",
		entityId: task.id,
		metadata: {
			title: task.title,
			listId: list.id,
			listName: list.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: deletedTask,
	};
}

export async function moveTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	destinationListId: string,
	newPosition: number,
) {
	const user = await getCurrentUser();

	if (!Number.isFinite(newPosition)) {
		return {
			success: false as const,
			message: "Invalid task position.",
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

	const { project } = access.data;

	const taskResult = await requireTask(taskId);

	if (!taskResult.success) {
		return { success: false as const, message: taskResult.message };
	}

	const task = taskResult.data;

	const currentListResult = await requireList(task.listId);

	if (!currentListResult.success) {
		return { success: false as const, message: currentListResult.message };
	}

	const currentList = currentListResult.data;

	const destinationListResult = await requireList(destinationListId);

	if (!destinationListResult.success) {
		return { success: false as const, message: destinationListResult.message };
	}

	const destinationList = destinationListResult.data;

	if (
		currentList.projectId !== project.id ||
		destinationList.projectId !== project.id
	) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const enteringDone =
		destinationList.type === "done" && currentList.type !== "done";
	const leavingDone =
		currentList.type === "done" && destinationList.type !== "done";

	const movedTask = await updateTaskPosition(
		task.id,
		destinationListId,
		newPosition,
		enteringDone ? new Date() : leavingDone ? null : undefined,
	);

	// Self-heals if repeated midpoint splits ever collapse a gap.
	await rebalanceTaskPositionsIfNeeded(destinationListId);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: enteringDone ? "completed" : "moved",
		entity: "task",
		entityId: task.id,
		metadata: {
			title: task.title,
			fromList: currentList.name,
			toList: destinationList.name,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: movedTask,
	};
}
