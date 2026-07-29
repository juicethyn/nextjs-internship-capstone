import { eq } from "drizzle-orm";
import type { CreateTaskInput, UpdateTaskInput } from "../../validations/task";
import { db } from "../index";
import { tasks } from "../schema";

export function getTasksByList(listId: string) {
	return db.query.tasks.findMany({
		where: eq(tasks.listId, listId),
		orderBy: (task, { asc }) => [asc(task.position)],
		with: {
			assignee: true,
			labels: {
				with: {
					label: true,
				},
			},
			comments: true,
		},
	});
}

export function getTaskById(id: string) {
	return db.query.tasks.findFirst({
		where: eq(tasks.id, id),
		with: {
			comments: {
				with: {
					author: true,
				},
			},
			labels: {
				with: {
					label: true,
				},
			},
		},
	});
}

export function getTasksByAssignee(userId: string) {
	return db.query.tasks.findMany({
		where: eq(tasks.assigneeId, userId),
	});
}

export async function createTask(
	listId: string,
	createdById: string,
	data: CreateTaskInput,
) {
	const [task] = await db
		.insert(tasks)
		.values({ ...data, listId, createdById, position: 1000 })
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

export async function updateTaskPosition(
	id: string,
	listId: string,
	position: number,
) {
	const [task] = await db
		.update(tasks)
		.set({ listId, position })
		.where(eq(tasks.id, id))
		.returning();
	return task;
}

export async function completeTask(id: string) {
	const [task] = await db
		.update(tasks)
		.set({ completedAt: new Date() })
		.where(eq(tasks.id, id))
		.returning();
	return task;
}

export async function reopenTask(id: string) {
	const [task] = await db
		.update(tasks)
		.set({
			completedAt: null,
		})
		.where(eq(tasks.id, id))
		.returning();

	return task;
}
