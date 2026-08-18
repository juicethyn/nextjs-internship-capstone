import { AnalyticsHeader } from "@/features/analytics/components/analytics-header";
import { AnalyticsInsights } from "@/features/analytics/components/analytics-insights";
import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview";
import { TeamContributions } from "@/features/analytics/components/team-contributions";

type AnalyticsPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { workspaceSlug } = await params;

	return (
		<div className="space-y-6">
			<AnalyticsHeader workspaceSlug={workspaceSlug} />
			<AnalyticsOverview workspaceSlug={workspaceSlug} />
			<AnalyticsInsights workspaceSlug={workspaceSlug} />
			<TeamContributions workspaceSlug={workspaceSlug} />
		</div>
	);
}
