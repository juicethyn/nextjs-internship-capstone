"use server";

import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	createComment,
	deleteComment,
	getCommentsByTask,
	updateComment,
} from "../db/queries/comments";
import { getListById } from "../db/queries/lists";
import {
	requireActiveProject,
	requireComment,
	requireList,
	requireProjectMember,
	requireTask,
} from "../permission";
import {
	type CreateCommentInput,
	createCommentSchema,
	type UpdateCommentInput,
	updateCommentSchema,
} from "../validations/comment";

export async function getCommentsByTaskAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await getListById(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
			error: "Task does not belong to the project.",
		};
	}

	const comments = await getCommentsByTask(taskId);

	return {
		success: true,
		data: comments,
	};
}

export async function createCommentAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	data: CreateCommentInput,
) {
	const user = await getCurrentUser();

	const validatedData = createCommentSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid comment data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const task = await requireTask(taskId);

	const list = await getListById(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
			error: "Task does not belong to the project.",
		};
	}

	const comment = await createComment(taskId, user.id, validatedData.data);

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "created",
		entity: "comment",
		entityId: comment.id,
		metadata: {
			taskTitle: task.title,
		},
	});

	return {
		success: true,
		data: comment,
	};
}

export async function updateCommentAction(
	workspaceSlug: string,
	projectSlug: string,
	commentId: string,
	data: UpdateCommentInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateCommentSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid comment data.",
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const comment = await requireComment(commentId);

	const task = await requireTask(comment.taskId);

	const list = await requireList(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
			error: "Comment does not belong to the project.",
		};
	}

	const updatedComment = await updateComment(commentId, validatedData.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "updated",
		entity: "comment",
		entityId: comment.id,
		metadata: {
			taskTitle: task.title,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true,
		data: updatedComment,
	};
}

export async function deleteCommentAction(
	workspaceSlug: string,
	projectSlug: string,
	commentId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const comment = await requireComment(commentId);

	const task = await requireTask(comment.taskId);

	const list = await requireList(task.listId);

	if (list?.projectId !== project.id) {
		return {
			success: false,
			error: "Comment does not belong to the project.",
		};
	}

	const deletedComment = await deleteComment(commentId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "deleted",
		entity: "comment",
		entityId: comment.id,
		metadata: {
			taskTitle: task.title,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true,
		data: deletedComment,
	};
}
