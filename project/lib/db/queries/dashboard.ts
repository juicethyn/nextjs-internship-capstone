import { and, count, eq, gt, sql } from "drizzle-orm";
import type { OverviewRanges } from "@/features/dashboard/lib/date-range";
import { db } from "../index";
import {
	lists,
	projects,
	tasks,
	workspaceInvitations,
	workspaceMembers,
} from "../schema";

export async function getWorkspaceOverviewStats(
	workspaceId: string,
	ranges: OverviewRanges,
	includePendingInvites: boolean,
) {
	const { todayStart, yesterdayStart, dayBeforeStart, weekStart, weekEnd } =
		ranges;

	const [projectCounts, memberCounts, inviteCounts, taskCounts] =
		await Promise.all([
			db
				.select({
					active: count(
						sql`case when ${projects.status} = 'active' and ${projects.isArchived} = false then 1 end`,
					),
					newThisWeek: count(
						sql`case when ${projects.status} = 'active' and ${projects.isArchived} = false and ${projects.createdAt} >= ${weekStart} then 1 end`,
					),
				})
				.from(projects)
				.where(eq(projects.workspaceId, workspaceId)),

			db
				.select({ total: count() })
				.from(workspaceMembers)
				.where(eq(workspaceMembers.workspaceId, workspaceId)),

			includePendingInvites
				? db
						.select({ total: count() })
						.from(workspaceInvitations)
						.where(
							and(
								eq(workspaceInvitations.workspaceId, workspaceId),
								eq(workspaceInvitations.status, "pending"),
								gt(workspaceInvitations.expiresAt, new Date()),
							),
						)
				: Promise.resolve([{ total: 0 }]),

			db
				.select({
					completedYesterday: count(
						sql`case when ${tasks.completedAt} >= ${yesterdayStart} and ${tasks.completedAt} < ${todayStart} then 1 end`,
					),
					completedDayBefore: count(
						sql`case when ${tasks.completedAt} >= ${dayBeforeStart} and ${tasks.completedAt} < ${yesterdayStart} then 1 end`,
					),
					dueThisWeek: count(
						sql`case when ${tasks.completedAt} is null and ${tasks.dueDate} >= ${weekStart} and ${tasks.dueDate} < ${weekEnd} then 1 end`,
					),
					overdue: count(
						sql`case when ${tasks.completedAt} is null and ${tasks.dueDate} < ${todayStart} then 1 end`,
					),
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
		]);

	return {
		activeProjects: {
			total: projectCounts[0]?.active ?? 0,
			newThisWeek: projectCounts[0]?.newThisWeek ?? 0,
		},
		teamMembers: {
			total: memberCounts[0]?.total ?? 0,
			pendingInvites: includePendingInvites
				? (inviteCounts[0]?.total ?? 0)
				: null,
		},
		completedYesterday: {
			total: taskCounts[0]?.completedYesterday ?? 0,
			previousDay: taskCounts[0]?.completedDayBefore ?? 0,
		},
		dueThisWeek: {
			total: taskCounts[0]?.dueThisWeek ?? 0,
			overdue: taskCounts[0]?.overdue ?? 0,
		},
	};
}
