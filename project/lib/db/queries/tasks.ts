import { asc, eq, max } from "drizzle-orm";
import { buildRebalancedPositions, needsRebalance } from "@/lib/positioning";
import type { CreateTaskInput, UpdateTaskInput } from "../../validations/task";
import { db } from "../index";
import { tasks } from "../schema";

export function getTasksByList(listId: string) {
	return db.query.tasks.findMany({
		where: eq(tasks.listId, listId),
		orderBy: (task, { asc }) => [asc(task.position)],
		with: {
			assignee: true,
			taskLabels: {
				with: {
					taskLabel: true,
				},
			},
			comments: true,
		},
	});
}

export function getTaskById(taskId: string) {
	return db.query.tasks.findFirst({
		where: eq(tasks.id, taskId),
		with: {
			comments: {
				with: {
					author: true,
				},
			},
			taskLabels: {
				with: {
					taskLabel: true,
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

const TASK_POSITION_STEP = 1000;

export async function createTask(
	listId: string,
	createdById: string,
	data: CreateTaskInput,
) {
	const [{ maxPosition }] = await db
		.select({ maxPosition: max(tasks.position) })
		.from(tasks)
		.where(eq(tasks.listId, listId));

	const [task] = await db
		.insert(tasks)
		.values({
			...data,
			listId,
			createdById,
			position: (maxPosition ?? 0) + TASK_POSITION_STEP,
		})
		.returning();
	return task;
}

export async function updateTask(taskId: string, data: UpdateTaskInput) {
	const [task] = await db
		.update(tasks)
		.set(data)
		.where(eq(tasks.id, taskId))
		.returning();
	return task;
}

export async function deleteTask(taskId: string) {
	const [task] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();
	return task;
}

export async function updateTaskPosition(
	taskId: string,
	destinationListId: string,
	newPosition: number,
	completedAt?: Date | null,
) {
	const [task] = await db
		.update(tasks)
		.set({
			listId: destinationListId,
			position: newPosition,
			...(completedAt !== undefined && { completedAt }),
		})
		.where(eq(tasks.id, taskId))
		.returning();
	return task;
}

export async function rebalanceTaskPositionsIfNeeded(listId: string) {
	const current = await db
		.select({ id: tasks.id, position: tasks.position })
		.from(tasks)
		.where(eq(tasks.listId, listId))
		.orderBy(asc(tasks.position));

	const hasCollapsedGap = current.some(
		(task, index) =>
			index > 0 && needsRebalance(current[index - 1].position, task.position),
	);

	if (!hasCollapsedGap) {
		return false;
	}

	const positions = buildRebalancedPositions(current.length);

	await db.transaction(async (tx) => {
		await Promise.all(
			current.map((task, index) =>
				tx
					.update(tasks)
					.set({ position: positions[index] })
					.where(eq(tasks.id, task.id)),
			),
		);
	});

	return true;
}

export async function completeTask(taskId: string) {
	const [task] = await db
		.update(tasks)
		.set({ completedAt: new Date() })
		.where(eq(tasks.id, taskId))
		.returning();
	return task;
}

export async function reopenTask(taskId: string) {
	const [task] = await db
		.update(tasks)
		.set({
			completedAt: null,
		})
		.where(eq(tasks.id, taskId))
		.returning();

	return task;
}
