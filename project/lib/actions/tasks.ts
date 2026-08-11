"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { syncProjectCompletionStatus } from "../db/queries/projects";
import {
	createTask,
	deleteTask,
	getTasksByList,
	updateTask,
	updateTaskPosition,
} from "../db/queries/tasks";
import {
	isWorkspaceMember,
	requireActiveProject,
	requireList,
	requireProjectMember,
	requireTask,
} from "../permission";
import {
	type CreateTaskInput,
	createTaskSchema,
	type UpdateTaskInput,
	updateTaskSchema,
} from "../validations/task";

export async function getTasksByListBySlug(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
			message: "List does not belong to the project.",
		};
	}

	const task = await getTasksByList(listId);

	return {
		success: true,
		data: task,
	};
}

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
			success: false,
			message: "Invalid task data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
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
				success: false,
				message: "Assignee is not a member of this workspace.",
			};
		}
	}

	const task = await createTask(listId, user.id, validatedData.data);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
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
		success: true,
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
			success: false,
			message: "Invalid task data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await requireList(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
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
				success: false,
				message: "Assignee is not a member of this workspace.",
			};
		}
	}

	const updatedTask = await updateTask(task.id, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
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
		success: true,
		data: updatedTask,
	};
}

export async function deleteTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await requireList(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
			message: "Task does not belong to the project.",
		};
	}

	const deletedTask = await deleteTask(taskId);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
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
		success: true,
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

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const currentList = await requireList(task.listId);

	const destinationList = await requireList(destinationListId);

	if (
		currentList.projectId !== project.id ||
		destinationList.projectId !== project.id
	) {
		return {
			success: false,
			message: "Task does not belong to the project.",
		};
	}

	const movedTask = await updateTaskPosition(
		task.id,
		destinationListId,
		newPosition,
	);

	await syncProjectCompletionStatus(project.id);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "moved",
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
		success: true,
		data: movedTask,
	};
}
