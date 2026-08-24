import { eq } from "drizzle-orm";
import { db } from "../index";
import { taskAttachments } from "../schema";

type CreateTaskAttachmentInput = {
	taskId: string;
	uploadedById: string;
	fileKey: string;
	fileName: string;
	fileSize: number;
	fileType: string;
};

export function getTaskAttachments(taskId: string) {
	return db.query.taskAttachments.findMany({
		where: eq(taskAttachments.taskId, taskId),
		orderBy: (attachment, { asc }) => [asc(attachment.createdAt)],
		with: {
			uploadedBy: true,
		},
	});
}

export function getTaskAttachmentById(id: string) {
	return db.query.taskAttachments.findFirst({
		where: eq(taskAttachments.id, id),
	});
}

export async function createTaskAttachment(data: CreateTaskAttachmentInput) {
	const [attachment] = await db
		.insert(taskAttachments)
		.values(data)
		.returning();

	return attachment;
}

export async function deleteTaskAttachment(id: string) {
	const [attachment] = await db
		.delete(taskAttachments)
		.where(eq(taskAttachments.id, id))
		.returning();

	return attachment;
}
