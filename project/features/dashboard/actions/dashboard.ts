"use server";

import { getOverviewRanges } from "@/features/dashboard/lib/date-range";
import { getCurrentUser } from "@/lib/auth";
import {
	getRecentProjectActivity,
	getVisibleProjectIds,
} from "@/lib/db/queries/activityLogs";
import {
	getWorkspaceOverviewStats,
	getWorkspaceTaskStatusDistribution,
} from "@/lib/db/queries/dashboard";
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
		data: activity,
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
