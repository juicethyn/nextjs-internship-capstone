"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import {
	createComment,
	deleteComment,
	getCommentById,
	getCommentsByTaskId,
	updateComment,
} from "../db/queries/comments";
import { getListById } from "../db/queries/lists";
import { getProjectById } from "../db/queries/projects";
import { getTaskById } from "../db/queries/tasks";
import {
	createCommentSchema,
	updateCommentSchema,
} from "../validations/comment";

export async function createCommentAction(taskId: string, formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createCommentSchema.safeParse({
		content: formData.get("content"),
	});

	if (!parsed.success) {
		return {
			success: false,
			error: treeifyError(parsed.error),
		};
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

	const comment = await createComment(taskId, userId, parsed.data);

	if (!comment) {
		return {
			success: false,
			error: "Failed to create comment.",
		};
	}

	revalidatePath(`/projects/${project.id}`);

	return { success: true, comment };
}

export async function updateCommentAction(
	commentId: string,
	formData: FormData,
) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = updateCommentSchema.safeParse({
		content: formData.get("content"),
	});

	if (!parsed.success) {
		return {
			success: false,
			error: treeifyError(parsed.error),
		};
	}

	const comment = await getCommentById(commentId);

	if (!comment) {
		return {
			success: false,
			error: "Comment not found or you do not have access to it.",
		};
	}

	const task = await getTaskById(comment.taskId);

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

	const updatedComment = await updateComment(commentId, parsed.data);

	if (!updatedComment) {
		return {
			success: false,
			error: "Failed to update comment.",
		};
	}

	revalidatePath(`/projects/${project.id}`);

	return { success: true, comment: updatedComment };
}

export async function deleteCommentAction(commentId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const comment = await getCommentById(commentId);

	if (!comment) {
		return {
			success: false,
			error: "Comment not found or you do not have access to it.",
		};
	}

	const task = await getTaskById(comment.taskId);

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

	const deletedComment = await deleteComment(commentId);

	if (!deletedComment) {
		return {
			success: false,
			error: "Failed to delete comment.",
		};
	}

	revalidatePath(`/projects/${project.id}`);

	return { success: true, comment: deletedComment };
}

export async function getCommentsByTaskAction(taskId: string) {
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

	const comments = await getCommentsByTaskId(taskId);

	if (!comments) {
		return {
			success: false,
			error: "Failed to retrieve comments.",
		};
	}

	return { success: true, comments };
}
