import { and, eq } from "drizzle-orm";
import { generateProjectSlug } from "@/lib/utils/slug";
import type {
	CreateProjectInput,
	UpdateProjectInput,
} from "@/lib/validations/project";
import { db } from "../index";
import { projects } from "../schema";

// CRUD Operations

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

export function getProjectBySlug(workspaceId: string, slug: string) {
	return db.query.projects.findFirst({
		where: and(eq(projects.workspaceId, workspaceId), eq(projects.slug, slug)),
	});
}

export async function createProject(
	workspaceId: string,
	leadId: string,
	data: CreateProjectInput,
) {
	const slug = generateProjectSlug(data.name);

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
	const slug = data.name ? generateProjectSlug(data.name) : undefined;

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

export async function deleteProject(id: string) {
	const [project] = await db
		.delete(projects)
		.where(eq(projects.id, id))
		.returning();

	return project;
}

// Business Operations

export async function transferProjectLead(
	projectId: string,
	newLeadId: string,
) {
	const [project] = await db
		.update(projects)
		.set({
			leadId: newLeadId,
		})
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}

export async function archiveProject(projectId: string) {
	const [project] = await db
		.update(projects)
		.set({
			isArchived: true,
		})
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}

export async function restoreProject(projectId: string) {
	const [project] = await db
		.update(projects)
		.set({
			isArchived: false,
		})
		.where(eq(projects.id, projectId))
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
