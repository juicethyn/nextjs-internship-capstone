"use server";

import {
	PROJECT_PROGRESS_LIMIT,
	PROJECT_STATUS_COLORS,
} from "@/features/analytics/constants";
import { getAnalyticsRanges } from "@/features/analytics/lib/date-range";
import { getCurrentUser } from "@/lib/auth";
import {
	getAnalyticsOverviewStats,
	getProjectProgressRows,
	getProjectStatusDistribution,
	getTaskPriorityDistribution as getTaskPriorityDistributionQuery,
} from "@/lib/db/queries/analytics";
import { getCalendarProjects } from "@/lib/db/queries/calendar";
import { getVisibleProjectIds } from "@/lib/db/queries/projects";
import { requireWorkspaceMember } from "@/lib/permission";

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
	projectId: string | null,
) {
	const scope = await resolveScope(workspaceSlug, projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const stats = await getAnalyticsOverviewStats(
		scope.workspaceId,
		getAnalyticsRanges(new Date()),
		projectId,
	);

	return {
		success: true as const,
		data: stats,
	};
}

export async function getTaskPriorityDistribution(
	workspaceSlug: string,
	projectId: string | null,
) {
	const scope = await resolveScope(workspaceSlug, projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const distribution = await getTaskPriorityDistributionQuery(
		scope.workspaceId,
		projectId,
	);

	return {
		success: true as const,
		data: distribution,
	};
}

export async function getAnalyticsProjectOptions(workspaceSlug: string) {
	const scope = await resolveScope(workspaceSlug, null);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	const options = await getCalendarProjects(
		scope.workspaceId,
		scope.visibleProjectIds,
	);

	return {
		success: true as const,
		data: options,
	};
}

export async function getProjectProgress(
	workspaceSlug: string,
	projectId: string | null,
) {
	const scope = await resolveScope(workspaceSlug, projectId);

	if (!scope.success) {
		return { success: false as const, message: scope.message };
	}

	if (projectId) {
		const distribution = await getProjectStatusDistribution(projectId);

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
