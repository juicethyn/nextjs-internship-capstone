"use server";

import { UTApi } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth";
import { publishBoardEvent } from "@/lib/board-events";
import {
	deleteTaskAttachment,
	getTaskAttachmentById,
	getTaskAttachments,
} from "@/lib/db/queries/taskAttachments";
import {
	requireActiveProject,
	requireList,
	requireProjectMember,
	requireTask,
} from "@/lib/permission";

const utapi = new UTApi();

const DOWNLOAD_URL_TTL_SECONDS = 60 * 5;

async function requireTaskInProject(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
	userId: string,
) {
	const access = await requireProjectMember(workspaceSlug, projectSlug, userId);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const taskResult = await requireTask(taskId);

	if (!taskResult.success) {
		return { success: false as const, message: taskResult.message };
	}

	const listResult = await requireList(taskResult.data.listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	if (listResult.data.projectId !== access.data.project.id) {
		return {
			success: false as const,
			message: "Task does not belong to the project.",
		};
	}

	return { success: true as const, data: access.data };
}

export async function getTaskAttachmentsAction(
	workspaceSlug: string,
	projectSlug: string,
	taskId: string,
) {
	const user = await getCurrentUser();

	const access = await requireTaskInProject(
		workspaceSlug,
		projectSlug,
		taskId,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const attachments = await getTaskAttachments(taskId);

	return {
		success: true as const,
		data: attachments.map((attachment) => ({
			...attachment,
			isOwn: attachment.uploadedById === user.id,
			canRemove: attachment.uploadedById === user.id || access.data.canManage,
		})),
	};
}

export async function getAttachmentDownloadUrlAction(
	workspaceSlug: string,
	projectSlug: string,
	attachmentId: string,
) {
	const user = await getCurrentUser();

	const attachment = await getTaskAttachmentById(attachmentId);

	if (!attachment) {
		return { success: false as const, message: "Attachment not found." };
	}

	const access = await requireTaskInProject(
		workspaceSlug,
		projectSlug,
		attachment.taskId,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	try {
		const { ufsUrl } = await utapi.generateSignedURL(attachment.fileKey, {
			expiresIn: DOWNLOAD_URL_TTL_SECONDS,
		});

		return {
			success: true as const,
			data: { url: ufsUrl, fileName: attachment.fileName },
		};
	} catch {
		return {
			success: false as const,
			message: "Couldn't prepare that download.",
		};
	}
}

export async function deleteTaskAttachmentAction(
	workspaceSlug: string,
	projectSlug: string,
	attachmentId: string,
) {
	const user = await getCurrentUser();

	const attachment = await getTaskAttachmentById(attachmentId);

	if (!attachment) {
		return { success: false as const, message: "Attachment not found." };
	}

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const scoped = await requireTaskInProject(
		workspaceSlug,
		projectSlug,
		attachment.taskId,
		user.id,
	);

	if (!scoped.success) {
		return { success: false as const, message: scoped.message };
	}

	if (attachment.uploadedById !== user.id && !access.data.canManage) {
		return {
			success: false as const,
			message: "You can only remove attachments you uploaded.",
		};
	}

	try {
		await utapi.deleteFiles(attachment.fileKey);
	} catch {
		return {
			success: false as const,
			message: "Couldn't remove that file. Try again.",
		};
	}

	const removed = await deleteTaskAttachment(attachmentId);

	await publishBoardEvent(
		access.data.project.id,
		user.id,
		"attachment_removed",
	);

	return { success: true as const, data: removed };
}
