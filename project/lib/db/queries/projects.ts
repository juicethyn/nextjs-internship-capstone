import { and, desc, eq } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import type {
	CreateProjectInput,
	UpdateProjectInput,
} from "@/lib/validations/project";
import { db } from "../index";
import { projects } from "../schema";

export function getProjectsByWorkspace(workspaceId: string) {
	return db.query.projects.findMany({
		where: eq(projects.workspaceId, workspaceId),
		with: {
			lists: { with: { tasks: true } },
			members: {
				with: {
					user: true,
				},
			},
		},
	});
}

export function getProjectById(id: string) {
	return db.query.projects.findFirst({
		where: eq(projects.id, id),
		with: {
			lists: {
				with: {
					tasks: true,
				},
			},
			members: {
				with: {
					user: true,
				},
			},
		},
	});
}

export function getProjectBySlug(slug: string) {
	return db.query.projects.findFirst({
		where: eq(projects.slug, slug),
	});
}

export async function createProject(
	workspaceId: string,
	leadId: string,
	data: CreateProjectInput,
) {
	const slug = generateSlug(data.name);

	const [project] = await db
		.insert(projects)
		.values({
			...data,
			slug,
			workspaceId,
			leadId,
		})
		.returning();

	return project;
}

export async function updateProject(id: string, data: UpdateProjectInput) {
	const slug = data.name ? generateSlug(data.name) : undefined;

	const [project] = await db
		.update(projects)
		.set({
			...data,
			slug,
		})
		.where(eq(projects.id, id))
		.returning();

	return project;
}

export async function deleteProjectById(id: string) {
	const [project] = await db
		.delete(projects)
		.where(eq(projects.id, id))
		.returning();

	return project;
}

// Will be used for the dashboard.ts queries
// export async function getRecentProjects(workspaceId: string, limit: number = 5) {
// 	return db.query.projects.findMany({
// 		where: eq(projects.workspaceId, workspaceId),
// 		orderBy: desc(projects.updatedAt),
// 		limit,
// 	});
// }
