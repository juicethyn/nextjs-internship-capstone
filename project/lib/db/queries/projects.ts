import { and, asc, count, eq, isNotNull, sql } from "drizzle-orm";
import { generateProjectSlug } from "@/lib/utils/slug";
import type { CreateProjectInput } from "@/lib/validations/project";
import type { DbClient } from "@/types/db";
import { db } from "../index";
import { lists, projectMembers, projects, tasks } from "../schema";

// CRUD Operations

// CREATE
export async function createProject(
	workspaceId: string,
	leadId: string,
	// labelIds lives on the join table, not on projects — the action strips it
	// before calling this.
	data: Omit<CreateProjectInput, "labelIds">,
	dbClient: DbClient = db,
) {
	const slug = generateProjectSlug();

	const [project] = await dbClient
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

// READ
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
			projectLabels: {
				with: {
					workspaceLabel: true,
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

// requireProjectBySlug returns the bare row above; the detail page needs relations.
export function getProjectBySlugWithRelations(
	workspaceId: string,
	slug: string,
) {
	return db.query.projects.findFirst({
		where: and(eq(projects.workspaceId, workspaceId), eq(projects.slug, slug)),
		with: {
			// Board order is position-driven, so hand back rows already sorted
			// instead of relying on the client to re-sort every render.
			lists: {
				orderBy: asc(lists.position),
				with: {
					tasks: {
						orderBy: asc(tasks.position),
						with: {
							assignee: true,
							taskLabels: { with: { taskLabel: true } },
							comments: { columns: { id: true } },
						},
					},
				},
			},
			// leadId can point at someone with no project_members row, so the roster
			// needs the lead's user record independently of members.
			lead: true,
			members: {
				with: {
					user: true,
				},
			},
			projectLabels: {
				with: {
					workspaceLabel: true,
				},
			},
		},
	});
}

// The slug is frozen at creation. Regenerating it on rename would change the
// project URL and 404 the page the user is standing on.
export async function updateProject(
	id: string,
	data: Partial<
		Omit<typeof projects.$inferInsert, "id" | "workspaceId" | "slug">
	>,
) {
	const [project] = await db
		.update(projects)
		.set(data)
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

// status and isArchived have to move together, otherwise ProjectStatusBadge
// keeps reporting "Active" for an archived project.
export async function archiveProject(projectId: string) {
	const [project] = await db
		.update(projects)
		.set({
			isArchived: true,
			status: "archived",
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
			status: "active",
		})
		.where(eq(projects.id, projectId))
		.returning();

	return project;
}

// A user counts as assigned to a project when they hold a project_members row
// OR they are the lead — leadId can point at someone with no membership row, so
// counting memberships alone would report 0 for a lead on their own project.
export async function getWorkspaceProjectAssignmentCounts(workspaceId: string) {
	const [memberships, leads] = await Promise.all([
		db
			.select({
				userId: projectMembers.userId,
				projectId: projects.id,
			})
			.from(projectMembers)
			.innerJoin(projects, eq(projects.id, projectMembers.projectId))
			.where(eq(projects.workspaceId, workspaceId)),

		db
			.select({
				userId: projects.leadId,
				projectId: projects.id,
			})
			.from(projects)
			.where(
				and(eq(projects.workspaceId, workspaceId), isNotNull(projects.leadId)),
			),
	]);

	const projectIdsByUser = new Map<string, Set<string>>();

	for (const row of [...memberships, ...leads]) {
		if (!row.userId) continue;

		const existing = projectIdsByUser.get(row.userId);

		if (existing) {
			existing.add(row.projectId);
			continue;
		}

		projectIdsByUser.set(row.userId, new Set([row.projectId]));
	}

	const counts: Record<string, number> = {};

	for (const [userId, projectIds] of projectIdsByUser) {
		counts[userId] = projectIds.size;
	}

	return counts;
}

// A project is completed once every task it has sits in a "done" list. The
// totalTasks > 0 guard keeps an empty project on "active" rather than counting
// "nothing to do" as "everything done".
export async function syncProjectCompletionStatus(projectId: string) {
	const [project] = await db
		.select({ status: projects.status, isArchived: projects.isArchived })
		.from(projects)
		.where(eq(projects.id, projectId));

	// Archiving wins over board activity.
	if (!project || project.isArchived) {
		return;
	}

	const [taskCounts] = await db
		.select({
			total: count(),
			done: count(sql`case when ${lists.type} = 'done' then 1 end`),
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(eq(lists.projectId, projectId));

	const nextStatus =
		taskCounts.total > 0 && taskCounts.done === taskCounts.total
			? "completed"
			: "active";

	if (nextStatus === project.status) {
		return;
	}

	await db
		.update(projects)
		.set({ status: nextStatus })
		.where(eq(projects.id, projectId));
}

// Will be used for the dashboard.ts queries
// export async function getRecentProjects(workspaceId: string, limit: number = 5) {
// 	return db.query.projects.findMany({
// 		where: eq(projects.workspaceId, workspaceId),
// 		orderBy: desc(projects.updatedAt),
// 		limit,
// 	});
// }
