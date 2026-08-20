import { and, asc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../index";
import { lists, projects, tasks, users, workspaceMembers } from "../schema";

const RESULT_LIMIT = 5;

export function toSearchPattern(term: string) {
	const escaped = term.replace(/[\\%_]/g, (char) => `\\${char}`);

	return `%${escaped}%`;
}

export async function searchProjects(
	visibleProjectIds: string[],
	pattern: string,
) {
	if (visibleProjectIds.length === 0) return [];

	return db
		.select({
			id: projects.id,
			name: projects.name,
			slug: projects.slug,
			color: projects.color,
		})
		.from(projects)
		.where(
			and(
				inArray(projects.id, visibleProjectIds),
				eq(projects.isArchived, false),
				ilike(projects.name, pattern),
			),
		)
		.orderBy(asc(projects.name))
		.limit(RESULT_LIMIT);
}

export async function searchTasks(
	visibleProjectIds: string[],
	pattern: string,
) {
	if (visibleProjectIds.length === 0) return [];

	return db
		.select({
			id: tasks.id,
			title: tasks.title,
			completedAt: tasks.completedAt,
			projectName: projects.name,
			projectSlug: projects.slug,
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				inArray(lists.projectId, visibleProjectIds),
				eq(projects.isArchived, false),
				ilike(tasks.title, pattern),
			),
		)
		.orderBy(sql`${tasks.completedAt} is not null`, asc(tasks.title))
		.limit(RESULT_LIMIT);
}

export async function searchMembers(workspaceId: string, pattern: string) {
	return db
		.select({
			id: users.id,
			firstName: users.firstName,
			lastName: users.lastName,
			email: users.email,
			imageUrl: users.imageUrl,
		})
		.from(workspaceMembers)
		.innerJoin(users, eq(workspaceMembers.userId, users.id))
		.where(
			and(
				eq(workspaceMembers.workspaceId, workspaceId),
				or(
					ilike(users.firstName, pattern),
					ilike(users.lastName, pattern),
					ilike(users.email, pattern),
					ilike(sql`${users.firstName} || ' ' || ${users.lastName}`, pattern),
				),
			),
		)
		.orderBy(asc(users.firstName), asc(users.lastName))
		.limit(RESULT_LIMIT);
}
