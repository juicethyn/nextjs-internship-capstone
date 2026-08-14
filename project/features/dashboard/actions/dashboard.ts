"use server";

import { getOverviewRanges } from "@/features/dashboard/lib/date-range";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceOverviewStats } from "@/lib/db/queries/dashboard";
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
