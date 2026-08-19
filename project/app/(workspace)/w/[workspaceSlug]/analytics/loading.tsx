import { AnalyticsHeaderSkeleton } from "@/features/analytics/components/analytics-header-skeleton";
import { AnalyticsInsightsSkeleton } from "@/features/analytics/components/analytics-insights-skeleton";
import { AnalyticsOverviewSkeleton } from "@/features/analytics/components/analytics-overview-skeleton";
import { TeamContributionsSkeleton } from "@/features/analytics/components/team-contributions-skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<AnalyticsHeaderSkeleton />
			<AnalyticsOverviewSkeleton />
			<AnalyticsInsightsSkeleton />
			<TeamContributionsSkeleton />
		</div>
	);
}
