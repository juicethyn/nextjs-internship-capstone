import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, lists, projects, tasks } from "@/lib/db/schema";

export async function getWorkspaceDeadlines(
	workspaceId: string,
	visibleProjectIds: string[],
) {
	if (visibleProjectIds.length === 0) return [];

	return db
		.select({
			id: tasks.id,
			title: tasks.title,
			priority: tasks.priority,
			dueDate: tasks.dueDate,
			completedAt: tasks.completedAt,
			projectId: projects.id,
			projectName: projects.name,
			projectSlug: projects.slug,
			projectColor: projects.color,
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				eq(projects.isArchived, false),
				inArray(projects.id, visibleProjectIds),
				isNotNull(tasks.dueDate),
			),
		)
		.orderBy(asc(tasks.dueDate));
}

export async function getWorkspaceEvents(
	workspaceId: string,
	visibleProjectIds: string[],
) {
	if (visibleProjectIds.length === 0) return [];

	return db
		.select({
			id: events.id,
			title: events.title,
			description: events.description,
			startAt: events.startAt,
			endAt: events.endAt,
			allDay: events.allDay,
			eventType: events.eventType,
			projectId: projects.id,
			projectName: projects.name,
			projectSlug: projects.slug,
			projectColor: projects.color,
		})
		.from(events)
		.innerJoin(projects, eq(events.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				eq(projects.isArchived, false),
				inArray(projects.id, visibleProjectIds),
			),
		)
		.orderBy(asc(events.startAt));
}

export async function createEvent(data: typeof events.$inferInsert) {
	const [event] = await db.insert(events).values(data).returning();

	return event;
}

export async function getCalendarProjects(
	workspaceId: string,
	visibleProjectIds: string[],
) {
	if (visibleProjectIds.length === 0) return [];

	return db
		.select({
			id: projects.id,
			name: projects.name,
			color: projects.color,
		})
		.from(projects)
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				eq(projects.isArchived, false),
				inArray(projects.id, visibleProjectIds),
			),
		)
		.orderBy(asc(projects.name));
}
