"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import {
	createComment,
	deleteComment,
	getCommentsByTask,
} from "@/lib/db/queries/comments";
import {
	requireActiveProject,
	requireComment,
	requireList,
	requireProjectMember,
	requireTask,
} from "@/lib/permission";
import {
	type CreateCommentInput,
	createCommentSchema,
} from "@/lib/validations/comment";

export async function getCommentsByTaskAction(
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

	const comments = await getCommentsByTask(taskId);

	return {
		success: true as const,
		data: comments.map((comment) => ({
			...comment,
			isOwn: comment.authorId === user.id,
		})),
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
			success: false as const,
			message: "Invalid comment data.",
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

	if (listResult.data.projectId !== project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	const comment = await createComment(taskId, user.id, validatedData.data);

	revalidatePath(`/w/${workspaceSlug}/projects/${projectSlug}`);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: "created",
		entity: "comment",
		entityId: comment.id,
		metadata: {
			taskTitle: task.title,
		},
	});

	return {
		success: true as const,
		data: comment,
	};
}

export async function deleteCommentAction(
	workspaceSlug: string,
	projectSlug: string,
	commentId: string,
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

	const commentResult = await requireComment(commentId);

	if (!commentResult.success) {
		return { success: false as const, message: commentResult.message };
	}

	const comment = commentResult.data;

	const taskResult = await requireTask(comment.taskId);

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
			message: "Comment does not belong to the project.",
		};
	}

	if (comment.authorId !== user.id) {
		return {
			success: false as const,
			message: "You can only delete your own comments.",
		};
	}

	const deletedComment = await deleteComment(commentId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
		action: "deleted",
		entity: "comment",
		entityId: comment.id,
		metadata: {
			taskTitle: task.title,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${projectSlug}`);

	return {
		success: true as const,
		data: deletedComment,
	};
}
