"use server";

import { getOverviewRanges } from "@/features/dashboard/lib/date-range";
import { PRIORITY_RANK } from "@/features/projects/kanban/lib/task-sort";
import { getCurrentUser } from "@/lib/auth";
import { getRecentProjectActivity } from "@/lib/db/queries/activityLogs";
import {
	getContinueWorking as getContinueWorkingQuery,
	getMyTasks as getMyTasksQuery,
	getWorkspaceOverviewStats,
	getWorkspaceTaskStatusDistribution,
} from "@/lib/db/queries/dashboard";
import { getVisibleProjectIds } from "@/lib/db/queries/projects";
import { requireWorkspaceMember } from "@/lib/permission";

export async function getDashboardHeaderData(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	return {
		success: true as const,
		data: {
			workspaceName: workspace.name,
			viewerRole,
		},
	};
}

export async function getWorkspaceOverview(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	const canSeePendingInvites = viewerRole === "owner" || viewerRole === "admin";

	const stats = await getWorkspaceOverviewStats(
		workspace.id,
		getOverviewRanges(new Date()),
		canSeePendingInvites,
	);

	return {
		success: true as const,
		data: stats,
	};
}

export async function getRecentActivity(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	const isWorkspaceManager = viewerRole === "owner" || viewerRole === "admin";

	const visibleProjectIds = await getVisibleProjectIds(
		workspace.id,
		user.id,
		isWorkspaceManager,
	);

	const activity = await getRecentProjectActivity(
		workspace.id,
		visibleProjectIds,
	);

	return {
		success: true as const,
		data: activity.map((entry) => ({
			...entry,
			isOwn: entry.actorId === user.id,
		})),
	};
}

export async function getWorkspaceHealth(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const distribution = await getWorkspaceTaskStatusDistribution(access.data.id);

	return {
		success: true as const,
		data: distribution,
	};
}

export async function getMyTasks(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const rows = await getMyTasksQuery(access.data.id, user.id);

	const { todayStart, tomorrowStart } = getOverviewRanges(new Date());

	const sorted = [...rows].sort((a, b) => {
		const byDue = (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0);

		if (byDue !== 0) return byDue;

		return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
	});

	const overdue = sorted.filter(
		(task) => task.dueDate && task.dueDate < todayStart,
	);

	const dueToday = sorted.filter(
		(task) =>
			task.dueDate &&
			task.dueDate >= todayStart &&
			task.dueDate < tomorrowStart,
	);

	const upcoming = sorted.filter(
		(task) => task.dueDate && task.dueDate >= tomorrowStart,
	);

	return {
		success: true as const,
		data: { overdue, dueToday, upcoming },
	};
}

export async function getContinueWorking(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	const isWorkspaceManager = viewerRole === "owner" || viewerRole === "admin";

	const visibleProjectIds = await getVisibleProjectIds(
		workspace.id,
		user.id,
		isWorkspaceManager,
	);

	const projects = await getContinueWorkingQuery(
		workspace.id,
		user.id,
		visibleProjectIds,
	);

	return {
		success: true as const,
		data: projects,
	};
}
