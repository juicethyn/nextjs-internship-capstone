import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	inArray,
	isNotNull,
	isNull,
	max,
	ne,
	notInArray,
	sql,
} from "drizzle-orm";
import type { OverviewRanges } from "@/features/dashboard/lib/date-range";
import { db } from "../index";
import {
	activityLogs,
	lists,
	projects,
	tasks,
	workspaceInvitations,
	workspaceMembers,
} from "../schema";

const utc = (date: Date) => sql`${date.toISOString()}::timestamp`;

export async function getWorkspaceOverviewStats(
	workspaceId: string,
	ranges: OverviewRanges,
	includePendingInvites: boolean,
) {
	const todayStart = utc(ranges.todayStart);
	const yesterdayStart = utc(ranges.yesterdayStart);
	const dayBeforeStart = utc(ranges.dayBeforeStart);
	const weekStart = utc(ranges.weekStart);
	const weekEnd = utc(ranges.weekEnd);

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

export async function getWorkspaceTaskStatusDistribution(workspaceId: string) {
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
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(projects.workspaceId, workspaceId),
				eq(projects.isArchived, false),
			),
		);

	return {
		todo: row?.todo ?? 0,
		inProgress: row?.inProgress ?? 0,
		done: row?.done ?? 0,
		total: row?.total ?? 0,
	};
}

export async function getMyTasks(workspaceId: string, userId: string) {
	return db
		.select({
			id: tasks.id,
			title: tasks.title,
			priority: tasks.priority,
			dueDate: tasks.dueDate,
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
				eq(tasks.assigneeId, userId),
				isNotNull(tasks.dueDate),
				isNull(tasks.completedAt),
				ne(lists.type, "done"),
			),
		)
		.orderBy(asc(tasks.dueDate));
}

export async function getContinueWorking(
	workspaceId: string,
	userId: string,
	visibleProjectIds: string[],
	limit = 3,
) {
	if (visibleProjectIds.length === 0) return [];

	const active = await db
		.select({ projectId: activityLogs.projectId })
		.from(activityLogs)
		.where(
			and(
				eq(activityLogs.workspaceId, workspaceId),
				eq(activityLogs.actorId, userId),
				isNotNull(activityLogs.projectId),
				inArray(activityLogs.projectId, visibleProjectIds),
			),
		)
		.groupBy(activityLogs.projectId)
		.orderBy(desc(max(activityLogs.createdAt)))
		.limit(limit);

	const rankedIds = active
		.map((row) => row.projectId)
		.filter((id): id is string => Boolean(id));

	if (rankedIds.length < limit) {
		const fill = await db
			.select({ id: projects.id })
			.from(projects)
			.where(
				and(
					eq(projects.workspaceId, workspaceId),
					eq(projects.isArchived, false),
					inArray(projects.id, visibleProjectIds),
					rankedIds.length > 0 ? notInArray(projects.id, rankedIds) : undefined,
				),
			)
			.orderBy(desc(projects.updatedAt))
			.limit(limit - rankedIds.length);

		rankedIds.push(...fill.map((row) => row.id));
	}

	if (rankedIds.length === 0) return [];

	const [rows, stats] = await Promise.all([
		db
			.select({
				id: projects.id,
				name: projects.name,
				slug: projects.slug,
				color: projects.color,
				dueDate: projects.dueDate,
			})
			.from(projects)
			.where(
				and(inArray(projects.id, rankedIds), eq(projects.isArchived, false)),
			),

		db
			.select({
				projectId: lists.projectId,
				total: count(),
				done: count(sql`case when ${lists.type} = 'done' then 1 end`),
			})
			.from(tasks)
			.innerJoin(lists, eq(tasks.listId, lists.id))
			.where(inArray(lists.projectId, rankedIds))
			.groupBy(lists.projectId),
	]);

	const statsByProject = new Map(stats.map((row) => [row.projectId, row]));
	const rowsById = new Map(rows.map((row) => [row.id, row]));

	return rankedIds
		.map((id) => rowsById.get(id))
		.filter((row): row is NonNullable<typeof row> => Boolean(row))
		.map((row) => {
			const stat = statsByProject.get(row.id);
			const total = stat?.total ?? 0;
			const done = stat?.done ?? 0;

			return {
				...row,
				total,
				remaining: total - done,
				progress: total === 0 ? 0 : Math.round((done / total) * 100),
			};
		});
}
