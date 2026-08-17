import { RecentActivitySkeleton } from "./recent-activity-skeleton";
import { WorkspaceHealthSkeleton } from "./workspace-health-skeleton";

export function DashboardInsightsSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-10">
			<div className="lg:relative lg:col-span-7">
				<div className="lg:absolute lg:inset-0">
					<RecentActivitySkeleton />
				</div>
			</div>

			<div className="lg:col-span-3">
				<WorkspaceHealthSkeleton />
			</div>
		</div>
	);
}
