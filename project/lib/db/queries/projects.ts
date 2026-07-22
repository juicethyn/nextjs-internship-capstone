import { and, eq } from "drizzle-orm";
import type {
	CreateProjectInput,
	UpdateProjectInput,
} from "@/lib/validations/project";
import { db } from "../index";
import { projects } from "../schema";

export function getProjectsByOwner(ownerId: string) {
	return db.query.projects.findMany({
		where: eq(projects.ownerId, ownerId),
		with: { lists: { with: { tasks: true } } },
	});
}

export function getProjectById(ownerId: string, id: string) {
	return db.query.projects.findFirst({
		where: and(eq(projects.id, id), eq(projects.ownerId, ownerId)),
		with: { lists: { with: { tasks: true } } },
	});
}

export async function createProject(ownerId: string, data: CreateProjectInput) {
	const [project] = await db
		.insert(projects)
		.values({ ...data, ownerId })
		.returning();
	return project;
}

export async function updateProject(
	ownerId: string,
	id: string,
	data: UpdateProjectInput,
) {
	const [project] = await db
		.update(projects)
		.set(data)
		.where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
		.returning();
	return project;
}

export async function deleteProject(ownerId: string, id: string) {
	const [project] = await db
		.delete(projects)
		.where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
		.returning();
	return project;
}
