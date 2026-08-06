import { asc, eq } from "drizzle-orm";
import type { CreateListInput, UpdateListInput } from "@/lib/validations/list";
import type { DbClient } from "@/types/db";
import { db } from "../index";
import { lists } from "../schema";

export const DEFAULT_LISTS = [
	{ name: "To Do", type: "todo", position: 1000 },
	{ name: "In Progress", type: "in_progress", position: 2000 },
	{ name: "Done", type: "done", position: 3000 },
] as const;

export async function createList(
	projectId: string,
	data: CreateListInput,
	dbClient: DbClient = db,
) {
	const [list] = await dbClient
		.insert(lists)
		.values({ ...data, projectId, position: 1000 })
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
