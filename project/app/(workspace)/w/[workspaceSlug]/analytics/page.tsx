import { AnalyticsHeader } from "@/features/analytics/components/analytics-header";
import { AnalyticsOverview } from "@/features/analytics/components/analytics-overview";

type AnalyticsPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { workspaceSlug } = await params;

	return (
		<div className="space-y-6">
			<AnalyticsHeader />
			<AnalyticsOverview workspaceSlug={workspaceSlug} />
		</div>
	);
}
