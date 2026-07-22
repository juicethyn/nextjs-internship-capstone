import { eq } from "drizzle-orm";
import type { CreateTaskInput, UpdateTaskInput } from "../../validations/task";
import { db } from "../index";
import { tasks } from "../schema";

export function getTasksByList(listId: string) {
	return db.query.tasks.findMany({
		where: eq(tasks.listId, listId),
		orderBy: (task, { asc }) => [asc(task.position)],
	});
}

export function getTaskById(id: string) {
	return db.query.tasks.findFirst({
		where: eq(tasks.id, id),
		with: { comments: true },
	});
}

export async function createTask(listId: string, data: CreateTaskInput) {
	const [task] = await db
		.insert(tasks)
		.values({ ...data, listId, position: 1000 })
		.returning();
	return task;
}

export async function updateTask(id: string, data: UpdateTaskInput) {
	const [task] = await db
		.update(tasks)
		.set(data)
		.where(eq(tasks.id, id))
		.returning();
	return task;
}

export async function deleteTask(id: string) {
	const [task] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
	return task;
}
