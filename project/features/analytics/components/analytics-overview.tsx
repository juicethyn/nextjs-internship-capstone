"use client";

import { Clock, Gauge, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { useAnalyticsOverview } from "@/features/analytics/hooks/use-analytics-overview";
import {
	formatDelta,
	formatMetricValue,
	formatPercent,
} from "@/features/analytics/lib/format-metric";
import { useAnalyticsUIStore } from "@/features/analytics/store";
import { AnalyticsOverviewSkeleton } from "./analytics-overview-skeleton";
import { AnalyticsStatCard } from "./analytics-stat-card";

type AnalyticsOverviewProps = {
	workspaceSlug: string;
};

const HEADING_CLASS =
	"text-xs font-bold uppercase tracking-wide text-muted-foreground";

export function AnalyticsOverview({ workspaceSlug }: AnalyticsOverviewProps) {
	const projectId = useAnalyticsUIStore((state) => state.projectId);

	const { data, isLoading, isError } = useAnalyticsOverview({
		workspaceSlug,
		projectId,
	});

	if (isLoading) {
		return <AnalyticsOverviewSkeleton />;
	}

	if (isError || !data) {
		return (
			<section className="space-y-3">
				<h2 className={HEADING_CLASS}>Overview</h2>

				<div className="flex items-center gap-3 rounded-xl bg-card px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
					<TriangleAlert className="size-4 shrink-0" />
					<span>Couldn't load analytics overview.</span>
				</div>
			</section>
		);
	}

	const { projectVelocity, teamEfficiency, activeUsers, avgTaskTime } = data;

	return (
		<section className="space-y-3">
			<h2 className={HEADING_CLASS}>Overview</h2>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<AnalyticsStatCard
					title="Project Velocity"
					value={formatMetricValue(projectVelocity.current, 1)}
					unit="tasks/day"
					icon={TrendingUp}
					delta={formatDelta(
						projectVelocity.current,
						projectVelocity.previous,
						1,
					)}
				/>

				<AnalyticsStatCard
					title="Team Efficiency"
					value={formatPercent(teamEfficiency.current)}
					unit="completion rate"
					icon={Gauge}
					delta={formatDelta(
						teamEfficiency.current,
						teamEfficiency.previous,
						0,
						"%",
					)}
				/>

				<AnalyticsStatCard
					title="Active Users"
					value={formatMetricValue(activeUsers.current, 0)}
					unit={`/ ${activeUsers.total} members`}
					icon={Users}
					delta={formatDelta(activeUsers.current, activeUsers.previous, 0)}
				/>

				<AnalyticsStatCard
					title="Avg Task Time"
					value={formatMetricValue(avgTaskTime.current, 1)}
					unit="days"
					icon={Clock}
					delta={formatDelta(avgTaskTime.current, avgTaskTime.previous, 1)}
					deltaDirection="lower-is-better"
				/>
			</div>
		</section>
	);
}
