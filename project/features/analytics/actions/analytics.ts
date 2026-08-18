"use server";

import { getAnalyticsRanges } from "@/features/analytics/lib/date-range";
import { getCurrentUser } from "@/lib/auth";
import { getAnalyticsOverviewStats } from "@/lib/db/queries/analytics";
import { requireWorkspaceMember } from "@/lib/permission";

export async function getAnalyticsOverview(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const stats = await getAnalyticsOverviewStats(
		access.data.id,
		getAnalyticsRanges(new Date()),
	);

	return {
		success: true as const,
		data: stats,
	};
}
