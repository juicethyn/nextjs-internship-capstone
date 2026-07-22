"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import { getListById } from "../db/queries/lists";
import { getProjectById } from "../db/queries/projects";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasksByList,
	updateTask,
} from "../db/queries/tasks";
import { createTaskSchema, updateTaskSchema } from "../validations/task";

export async function getTasksByListAction(listId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const list = await getListById(listId);

	if (!list) {
		return {
			success: false,
			error: "List not found or you do not have access to it.",
		};
	}

	const project = await getProjectById(userId, list.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const tasks = await getTasksByList(listId);

	return { success: true, tasks };
}

export async function createTaskAction(listId: string, formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createTaskSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority"),
		assigneeId: formData.get("assigneeId") || undefined,
		dueDate: formData.get("dueDate"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const lists = await getListById(listId);

	if (!lists) {
		return {
			success: false,
			error: "List not found or you do not have access to it.",
		};
	}

	const project = await getProjectById(userId, lists.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const task = await createTask(listId, parsed.data);

	revalidatePath(`/projects/${lists.projectId}`);

	return { success: true, task };
}

export async function updateTaskAction(taskId: string, formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = updateTaskSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority"),
		assigneeId: formData.get("assigneeId") || undefined,
		dueDate: formData.get("dueDate"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const task = await getTaskById(taskId);

	if (!task) {
		return {
			success: false,
			error: "Task not found or you do not have access to it.",
		};
	}

	const lists = await getListById(task.listId);

	if (!lists) {
		return {
			success: false,
			error: "List not found or you do not have access to it.",
		};
	}

	const project = await getProjectById(userId, lists.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const updatedTask = await updateTask(taskId, parsed.data);

	revalidatePath(`/projects/${lists.projectId}`);

	return { success: true, task: updatedTask };
}

export async function deleteTaskAction(taskId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const task = await getTaskById(taskId);

	if (!task) {
		return {
			success: false,
			error: "Task not found or you do not have access to it.",
		};
	}

	const list = await getListById(task.listId);

	if (!list) {
		return {
			success: false,
			error: "List not found or you do not have access to it.",
		};
	}

	const project = await getProjectById(userId, list.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const deletedTask = await deleteTask(taskId);

	revalidatePath(`/projects/${list.projectId}`);

	return { success: true, task: deletedTask };
}

export async function moveTaskAction() {
	// TO DO FOR DRAG AND DROP FEATURE
}
