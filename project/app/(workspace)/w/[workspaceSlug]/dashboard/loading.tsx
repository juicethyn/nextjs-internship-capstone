import { DashboardHeaderSkeleton } from "@/features/dashboard/components/dashboard-header-skeleton";
import { DashboardInsightsSkeleton } from "@/features/dashboard/components/dashboard-insights-skeleton";
import { DashboardWorkSkeleton } from "@/features/dashboard/components/dashboard-work-skeleton";
import { WorkspaceOverviewSkeleton } from "@/features/dashboard/components/workspace-overview-skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<DashboardHeaderSkeleton />
			<WorkspaceOverviewSkeleton />
			<DashboardInsightsSkeleton />
			<DashboardWorkSkeleton />
		</div>
	);
}
