import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { CreateActivityInput } from "@/lib/validations/activityLog";
import { db } from "../index";
import { activityLogs, projectMembers, projects } from "../schema";

export async function createActivity(data: CreateActivityInput) {
	const [activityLog] = await db.insert(activityLogs).values(data).returning();

	return activityLog;
}

export async function getWorkspaceActivity(workspaceId: string) {
	return db.query.activityLogs.findMany({
		where: eq(activityLogs.workspaceId, workspaceId),
		orderBy: (activityLog, { desc }) => desc(activityLog.createdAt),
		with: {
			actor: true,
		},
	});
}

export async function getVisibleProjectIds(
	workspaceId: string,
	userId: string,
	isWorkspaceManager: boolean,
) {
	if (isWorkspaceManager) {
		const rows = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.workspaceId, workspaceId));

		return rows.map((row) => row.id);
	}

	const rows = await db
		.select({ id: projects.id })
		.from(projects)
		.innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				eq(projectMembers.userId, userId),
			),
		);

	return rows.map((row) => row.id);
}

export async function getRecentProjectActivity(
	workspaceId: string,
	visibleProjectIds: string[],
	limit = 10,
) {
	if (visibleProjectIds.length === 0) return [];

	return db.query.activityLogs.findMany({
		where: and(
			eq(activityLogs.workspaceId, workspaceId),
			isNotNull(activityLogs.projectId),
			inArray(activityLogs.projectId, visibleProjectIds),
		),
		orderBy: (activityLog, { desc }) => desc(activityLog.createdAt),
		limit,
		with: {
			actor: true,
			project: true,
		},
	});
}
