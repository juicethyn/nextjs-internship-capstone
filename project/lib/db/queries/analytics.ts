import { and, count, eq, sql } from "drizzle-orm";
import {
	ANALYTICS_PERIOD_DAYS,
	type AnalyticsRanges,
} from "@/features/analytics/lib/date-range";
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

export async function getAnalyticsOverviewStats(
	workspaceId: string,
	ranges: AnalyticsRanges,
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
					eq(projects.isArchived, false),
				),
			),

		db
			.select({
				current: sql<string>`count(distinct case when ${activityLogs.createdAt} >= ${currentStart} and ${activityLogs.createdAt} < ${currentEnd} then ${activityLogs.actorId} end)`,
				previous: sql<string>`count(distinct case when ${activityLogs.createdAt} >= ${previousStart} and ${activityLogs.createdAt} < ${previousEnd} then ${activityLogs.actorId} end)`,
			})
			.from(activityLogs)
			.where(eq(activityLogs.workspaceId, workspaceId)),

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
			current: toNumber(taskRow?.completedCurrent ?? 0) / ANALYTICS_PERIOD_DAYS,
			previous:
				toNumber(taskRow?.completedPrevious ?? 0) / ANALYTICS_PERIOD_DAYS,
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
