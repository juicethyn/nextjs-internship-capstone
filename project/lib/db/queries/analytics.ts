import { and, count, eq, gte, inArray, isNotNull, lt, sql } from "drizzle-orm";
import type { AnalyticsRanges } from "@/features/analytics/lib/date-range";
import { db } from "../index";
import {
	activityLogs,
	lists,
	projects,
	tasks,
	workspaceMembers,
} from "../schema";

const utc = (date: Date) => sql`${date.toISOString()}::timestamp`;

const toNumber = (value: string | number | null) => Number(value ?? 0);

const toNullableNumber = (value: string | number | null) =>
	value === null ? null : Number(value);

const rate = (completed: number, created: number) =>
	created === 0 ? null : (completed / created) * 100;

type ScopeOptions = {
	projectId?: string | null;
	includeArchived?: boolean;
};

const archivedFilter = (includeArchived?: boolean) =>
	includeArchived ? undefined : eq(projects.isArchived, false);

export async function getAnalyticsOverviewStats(
	workspaceId: string,
	ranges: AnalyticsRanges,
	{ projectId, includeArchived }: ScopeOptions = {},
) {
	const currentStart = utc(ranges.currentStart);
	const currentEnd = utc(ranges.currentEnd);
	const previousStart = utc(ranges.previousStart);
	const previousEnd = utc(ranges.previousEnd);

	const [taskStats, activityStats, memberStats] = await Promise.all([
		db
			.select({
				completedCurrent: count(
					sql`case when ${tasks.completedAt} >= ${currentStart} and ${tasks.completedAt} < ${currentEnd} then 1 end`,
				),
				completedPrevious: count(
					sql`case when ${tasks.completedAt} >= ${previousStart} and ${tasks.completedAt} < ${previousEnd} then 1 end`,
				),
				createdCurrent: count(
					sql`case when ${tasks.createdAt} >= ${currentStart} and ${tasks.createdAt} < ${currentEnd} then 1 end`,
				),
				createdPrevious: count(
					sql`case when ${tasks.createdAt} >= ${previousStart} and ${tasks.createdAt} < ${previousEnd} then 1 end`,
				),
				createdAndClosedCurrent: count(
					sql`case when ${tasks.createdAt} >= ${currentStart} and ${tasks.createdAt} < ${currentEnd} and ${tasks.completedAt} is not null then 1 end`,
				),
				createdAndClosedPrevious: count(
					sql`case when ${tasks.createdAt} >= ${previousStart} and ${tasks.createdAt} < ${previousEnd} and ${tasks.completedAt} is not null then 1 end`,
				),
				cycleDaysCurrent: sql<
					string | null
				>`avg(extract(epoch from (${tasks.completedAt} - ${tasks.createdAt})) / 86400) filter (where ${tasks.completedAt} >= ${currentStart} and ${tasks.completedAt} < ${currentEnd} and ${tasks.completedAt} >= ${tasks.createdAt})`,
				cycleDaysPrevious: sql<
					string | null
				>`avg(extract(epoch from (${tasks.completedAt} - ${tasks.createdAt})) / 86400) filter (where ${tasks.completedAt} >= ${previousStart} and ${tasks.completedAt} < ${previousEnd} and ${tasks.completedAt} >= ${tasks.createdAt})`,
			})
			.from(tasks)
			.innerJoin(lists, eq(tasks.listId, lists.id))
			.innerJoin(projects, eq(lists.projectId, projects.id))
			.where(
				and(
					eq(projects.workspaceId, workspaceId),
					archivedFilter(includeArchived),
					projectId ? eq(projects.id, projectId) : undefined,
				),
			),

		db
			.select({
				current: sql<string>`count(distinct case when ${activityLogs.createdAt} >= ${currentStart} and ${activityLogs.createdAt} < ${currentEnd} then ${activityLogs.actorId} end)`,
				previous: sql<string>`count(distinct case when ${activityLogs.createdAt} >= ${previousStart} and ${activityLogs.createdAt} < ${previousEnd} then ${activityLogs.actorId} end)`,
			})
			.from(activityLogs)
			.where(
				and(
					eq(activityLogs.workspaceId, workspaceId),
					projectId ? eq(activityLogs.projectId, projectId) : undefined,
				),
			),

		db
			.select({ total: count() })
			.from(workspaceMembers)
			.where(eq(workspaceMembers.workspaceId, workspaceId)),
	]);

	const taskRow = taskStats[0];
	const activityRow = activityStats[0];
	const memberRow = memberStats[0];

	const createdCurrent = toNumber(taskRow?.createdCurrent ?? 0);
	const createdPrevious = toNumber(taskRow?.createdPrevious ?? 0);

	return {
		projectVelocity: {
			current: toNumber(taskRow?.completedCurrent ?? 0) / ranges.days,
			previous: toNumber(taskRow?.completedPrevious ?? 0) / ranges.days,
		},
		teamEfficiency: {
			current: rate(
				toNumber(taskRow?.createdAndClosedCurrent ?? 0),
				createdCurrent,
			),
			previous: rate(
				toNumber(taskRow?.createdAndClosedPrevious ?? 0),
				createdPrevious,
			),
		},
		activeUsers: {
			current: toNumber(activityRow?.current ?? 0),
			previous: toNumber(activityRow?.previous ?? 0),
			total: toNumber(memberRow?.total ?? 0),
		},
		avgTaskTime: {
			current: toNullableNumber(taskRow?.cycleDaysCurrent ?? null),
			previous: toNullableNumber(taskRow?.cycleDaysPrevious ?? null),
		},
	};
}

export async function getTaskPriorityDistribution(
	workspaceId: string,
	{ projectId, includeArchived }: ScopeOptions = {},
) {
	const [row] = await db
		.select({
			none: count(sql`case when ${tasks.priority} = 'none' then 1 end`),
			low: count(sql`case when ${tasks.priority} = 'low' then 1 end`),
			medium: count(sql`case when ${tasks.priority} = 'medium' then 1 end`),
			high: count(sql`case when ${tasks.priority} = 'high' then 1 end`),
			total: count(),
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				archivedFilter(includeArchived),
				projectId ? eq(projects.id, projectId) : undefined,
			),
		);

	return {
		none: row?.none ?? 0,
		low: row?.low ?? 0,
		medium: row?.medium ?? 0,
		high: row?.high ?? 0,
		total: row?.total ?? 0,
	};
}

export async function getProjectProgressRows(
	workspaceId: string,
	visibleProjectIds: string[],
	limit = 8,
	includeArchived?: boolean,
) {
	if (visibleProjectIds.length === 0) return { rows: [], totalProjects: 0 };

	const stats = await db
		.select({
			id: projects.id,
			name: projects.name,
			color: projects.color,
			total: count(),
			done: count(sql`case when ${lists.type} = 'done' then 1 end`),
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				archivedFilter(includeArchived),
				inArray(projects.id, visibleProjectIds),
			),
		)
		.groupBy(projects.id, projects.name, projects.color);

	const ranked = stats
		.map((row) => ({
			id: row.id,
			name: row.name,
			color: row.color,
			progress: Math.round((row.done / row.total) * 100),
		}))
		.sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name));

	return { rows: ranked.slice(0, limit), totalProjects: ranked.length };
}

export async function getTeamContributionCounts(
	workspaceId: string,
	ranges: AnalyticsRanges,
	{ projectId, includeArchived }: ScopeOptions = {},
) {
	const rows = await db
		.select({
			assigneeId: tasks.assigneeId,
			completed: count(),
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				archivedFilter(includeArchived),
				eq(lists.type, "done"),
				isNotNull(tasks.assigneeId),
				gte(tasks.completedAt, ranges.currentStart),
				lt(tasks.completedAt, ranges.currentEnd),
				projectId ? eq(projects.id, projectId) : undefined,
			),
		)
		.groupBy(tasks.assigneeId);

	return new Map(
		rows
			.filter((row): row is { assigneeId: string; completed: number } =>
				Boolean(row.assigneeId),
			)
			.map((row) => [row.assigneeId, toNumber(row.completed)]),
	);
}

export async function getProjectStatusDistribution(projectId: string) {
	const [row] = await db
		.select({
			todo: count(sql`case when ${lists.type} = 'todo' then 1 end`),
			inProgress: count(
				sql`case when ${lists.type} = 'in_progress' then 1 end`,
			),
			done: count(sql`case when ${lists.type} = 'done' then 1 end`),
			total: count(),
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(eq(lists.projectId, projectId));

	return {
		todo: row?.todo ?? 0,
		inProgress: row?.inProgress ?? 0,
		done: row?.done ?? 0,
		total: row?.total ?? 0,
	};
}
