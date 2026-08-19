"use server";

import {
	PROJECT_PROGRESS_LIMIT,
	PROJECT_STATUS_COLORS,
} from "@/features/analytics/constants";
import {
	getAnalyticsRanges,
	getPeriodDays,
} from "@/features/analytics/lib/date-range";
import type { AnalyticsFilters } from "@/features/analytics/types";
import { getCurrentUser } from "@/lib/auth";
import {
	getAnalyticsOverviewStats,
	getProjectProgressRows,
	getProjectStatusDistribution,
	getTaskPriorityDistribution as getTaskPriorityDistributionQuery,
	getTeamContributionCounts,
} from "@/lib/db/queries/analytics";
import { getCalendarProjects } from "@/lib/db/queries/calendar";
import { getProjectMembers } from "@/lib/db/queries/projectMembers";
import { getVisibleProjectIds } from "@/lib/db/queries/projects";
import { getWorkspaceMembersById } from "@/lib/db/queries/workspaceMembers";
import { requireWorkspaceMember } from "@/lib/permission";
import { memberDisplayName } from "@/lib/user-display";

const PROJECT_DENIED = "That project is not available in this workspace.";

async function resolveScope(workspaceSlug: string, projectId: string | null) {
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

	if (projectId && !visibleProjectIds.includes(projectId)) {
		return { success: false as const, message: PROJECT_DENIED };
	}

	return {
		success: true as const,
		workspaceId: workspace.id,
		visibleProjectIds,
	};
}

export async function getAnalyticsOverview(
	workspaceSlug: string,
	filters: AnalyticsFilters,
) {
	const scope = await resolveScope(workspaceSlug, filters.projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const stats = await getAnalyticsOverviewStats(
		scope.workspaceId,
		getAnalyticsRanges(new Date(), getPeriodDays(filters.period)),
		{ projectId: filters.projectId, includeArchived: filters.includeArchived },
	);

	return {
		success: true as const,
		data: stats,
	};
}

export async function getTaskPriorityDistribution(
	workspaceSlug: string,
	filters: AnalyticsFilters,
) {
	const scope = await resolveScope(workspaceSlug, filters.projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const distribution = await getTaskPriorityDistributionQuery(
		scope.workspaceId,
		{ projectId: filters.projectId, includeArchived: filters.includeArchived },
	);

	return {
		success: true as const,
		data: distribution,
	};
}

export async function getAnalyticsProjectOptions(
	workspaceSlug: string,
	includeArchived: boolean,
) {
	const scope = await resolveScope(workspaceSlug, null);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const options = await getCalendarProjects(
		scope.workspaceId,
		scope.visibleProjectIds,
		includeArchived,
	);

	return {
		success: true as const,
		data: options,
	};
}

export async function getTeamContributions(
	workspaceSlug: string,
	filters: AnalyticsFilters,
) {
	const scope = await resolveScope(workspaceSlug, filters.projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const [roster, counts] = await Promise.all([
		filters.projectId
			? getProjectMembers(filters.projectId)
			: getWorkspaceMembersById(scope.workspaceId),
		getTeamContributionCounts(
			scope.workspaceId,
			getAnalyticsRanges(new Date(), getPeriodDays(filters.period)),
			{
				projectId: filters.projectId,
				includeArchived: filters.includeArchived,
			},
		),
	]);

	const rows = roster
		.map((member) => ({
			userId: member.userId,
			firstName: member.user.firstName,
			lastName: member.user.lastName,
			email: member.user.email,
			imageUrl: member.user.imageUrl,
			completed: counts.get(member.userId) ?? 0,
		}))
		.sort(
			(a, b) =>
				b.completed - a.completed ||
				memberDisplayName(a).localeCompare(memberDisplayName(b)),
		);

	return {
		success: true as const,
		data: {
			rows,
			topCompleted: rows[0]?.completed ?? 0,
		},
	};
}

export async function getProjectProgress(
	workspaceSlug: string,
	filters: AnalyticsFilters,
) {
	const scope = await resolveScope(workspaceSlug, filters.projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	if (filters.projectId) {
		const distribution = await getProjectStatusDistribution(filters.projectId);

		if (distribution.total === 0) {
			return {
				success: true as const,
				data: { mode: "statuses" as const, rows: [], hiddenProjects: 0 },
			};
		}

		return {
			success: true as const,
			data: {
				mode: "statuses" as const,
				rows: [
					{
						key: "todo",
						label: "To Do",
						value: distribution.todo,
						color: PROJECT_STATUS_COLORS.todo,
					},
					{
						key: "in_progress",
						label: "In Progress",
						value: distribution.inProgress,
						color: PROJECT_STATUS_COLORS.in_progress,
					},
					{
						key: "done",
						label: "Done",
						value: distribution.done,
						color: PROJECT_STATUS_COLORS.done,
					},
				],
				hiddenProjects: 0,
			},
		};
	}

	const { rows, totalProjects } = await getProjectProgressRows(
		scope.workspaceId,
		scope.visibleProjectIds,
		PROJECT_PROGRESS_LIMIT,
		filters.includeArchived,
	);

	return {
		success: true as const,
		data: {
			mode: "projects" as const,
			rows: rows.map((row) => ({
				key: row.id,
				label: row.name,
				value: row.progress,
				color: row.color,
			})),
			hiddenProjects: Math.max(0, totalProjects - rows.length),
		},
	};
}
