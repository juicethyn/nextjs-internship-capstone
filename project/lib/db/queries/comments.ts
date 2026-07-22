import { eq } from "drizzle-orm";
import type {
	CreateCommentInput,
	UpdateCommentInput,
} from "@/lib/validations/comment";
import { db } from "../index";
import { comments } from "../schema";

export function getCommentsByTask(taskId: string) {
	return db.query.comments.findMany({
		where: eq(comments.taskId, taskId),
		orderBy: (comment, { asc }) => [asc(comment.createdAt)],
	});
}

export function getCommentById(id: string) {
	return db.query.comments.findFirst({
		where: eq(comments.id, id),
	});
}

export async function createComment(
	taskId: string,
	authorId: string,
	data: CreateCommentInput,
) {
	const [comment] = await db
		.insert(comments)
		.values({ ...data, taskId, authorId })
		.returning();
	return comment;
}

export async function updateComment(id: string, data: UpdateCommentInput) {
	const [comment] = await db
		.update(comments)
		.set(data)
		.where(eq(comments.id, id))
		.returning();
	return comment;
}

export async function deleteComment(id: string) {
	const [comment] = await db
		.delete(comments)
		.where(eq(comments.id, id))
		.returning();
	return comment;
}
