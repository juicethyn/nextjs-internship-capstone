import { asc, eq, max } from "drizzle-orm";
import {
	buildRebalancedPositions,
	needsRebalance,
} from "@/lib/utils/positioning";
import type { CreateListInput, UpdateListInput } from "@/lib/validations/list";
import type { DbClient } from "@/types/db";
import { db } from "../index";
import { lists } from "../schema";

export const DEFAULT_LISTS = [
	{ name: "To Do", type: "todo", position: 1000 },
	{ name: "In Progress", type: "in_progress", position: 2000 },
	{ name: "Done", type: "done", position: 3000 },
] as const;

const LIST_POSITION_STEP = 1000;

export async function createList(
	projectId: string,
	data: CreateListInput,
	dbClient: DbClient = db,
) {
	const [{ maxPosition }] = await dbClient
		.select({ maxPosition: max(lists.position) })
		.from(lists)
		.where(eq(lists.projectId, projectId));

	const [list] = await dbClient
		.insert(lists)
		.values({
			...data,
			projectId,
			position: (maxPosition ?? 0) + LIST_POSITION_STEP,
		})
		.returning();
	return list;
}

export async function createDefaultLists(
	projectId: string,
	dbClient: DbClient = db,
) {
	return dbClient
		.insert(lists)
		.values(DEFAULT_LISTS.map((list) => ({ ...list, projectId })))
		.returning();
}

export function getListsByProject(projectId: string) {
	return db.query.lists.findMany({
		where: eq(lists.projectId, projectId),
		orderBy: asc(lists.position),
		with: { tasks: true },
	});
}

export function getListById(id: string) {
	return db.query.lists.findFirst({
		where: eq(lists.id, id),
		with: { tasks: true },
	});
}

export async function updateList(id: string, data: UpdateListInput) {
	const [list] = await db
		.update(lists)
		.set(data)
		.where(eq(lists.id, id))
		.returning();
	return list;
}

export async function deleteList(id: string) {
	const [list] = await db.delete(lists).where(eq(lists.id, id)).returning();
	return list;
}

export async function updateListPosition(id: string, position: number) {
	const [list] = await db
		.update(lists)
		.set({ position })
		.where(eq(lists.id, id))
		.returning();
	return list;
}

// Escape hatch for when repeated midpoint splits exhaust the gap between two
// lists. Runs after a move: if any adjacent pair has collapsed, renumber the
// project's lists to clean 1000-steps, preserving the current order.
export async function rebalanceListPositionsIfNeeded(projectId: string) {
	const current = await db
		.select({ id: lists.id, position: lists.position })
		.from(lists)
		.where(eq(lists.projectId, projectId))
		.orderBy(asc(lists.position));

	const hasCollapsedGap = current.some(
		(list, index) =>
			index > 0 && needsRebalance(current[index - 1].position, list.position),
	);

	if (!hasCollapsedGap) {
		return false;
	}

	const positions = buildRebalancedPositions(current.length);

	await db.transaction(async (tx) => {
		await Promise.all(
			current.map((list, index) =>
				tx
					.update(lists)
					.set({ position: positions[index] })
					.where(eq(lists.id, list.id)),
			),
		);
	});

	return true;
}
