import { eq } from "drizzle-orm";
import type { CreateListInput, UpdateListInput } from "@/lib/validations/list";
import { db } from "../index";
import { lists } from "../schema";

export function getListsByProject(projectId: string) {
	return db.query.lists.findMany({
		where: eq(lists.projectId, projectId),
		with: { tasks: true },
	});
}

export function getListById(projectId: string) {
	return db.query.lists.findFirst({
		where: eq(lists.projectId, projectId),
		with: { tasks: true },
	});
}

export async function createList(projectId: string, data: CreateListInput) {
	const [list] = await db
		.insert(lists)
		.values({ ...data, projectId, position: 1000 })
		.returning();
	return list;
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
