import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import z from "zod";
import { getCurrentUser } from "@/lib/auth";
import { publishBoardEvent } from "@/lib/board-events";
import { createTaskAttachment } from "@/lib/db/queries/taskAttachments";
import {
	requireActiveProject,
	requireList,
	requireTask,
} from "@/lib/permission";

const f = createUploadthing();

const MAX_FILE_SIZE = "16MB";

export const ourFileRouter = {
	taskAttachment: f({
		image: {
			maxFileSize: "8MB",
			maxFileCount: 1,
			contentDisposition: "attachment",
		},
		pdf: {
			maxFileSize: MAX_FILE_SIZE,
			maxFileCount: 1,
			contentDisposition: "attachment",
		},
		"application/msword": {
			maxFileSize: MAX_FILE_SIZE,
			maxFileCount: 1,
			contentDisposition: "attachment",
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			maxFileSize: MAX_FILE_SIZE,
			maxFileCount: 1,
			contentDisposition: "attachment",
		},
	})
		.input(
			z.object({
				workspaceSlug: z.string(),
				projectSlug: z.string(),
				taskId: z.uuid(),
			}),
		)
		.middleware(async ({ input }) => {
			const user = await getCurrentUser();

			const access = await requireActiveProject(
				input.workspaceSlug,
				input.projectSlug,
				user.id,
			);

			if (!access.success) {
				throw new UploadThingError(access.message);
			}

			const taskResult = await requireTask(input.taskId);

			if (!taskResult.success) {
				throw new UploadThingError(taskResult.message);
			}

			const listResult = await requireList(taskResult.data.listId);

			if (!listResult.success) {
				throw new UploadThingError(listResult.message);
			}

			if (listResult.data.projectId !== access.data.project.id) {
				throw new UploadThingError("Task does not belong to the project.");
			}

			return {
				userId: user.id,
				taskId: input.taskId,
				projectId: access.data.project.id,
			};
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const attachment = await createTaskAttachment({
				taskId: metadata.taskId,
				uploadedById: metadata.userId,
				fileKey: file.key,
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
			});

			await publishBoardEvent(
				metadata.projectId,
				metadata.userId,
				"attachment_added",
			);

			return { attachmentId: attachment.id };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
