import { ProjectProgressSkeleton } from "./project-progress-skeleton";
import { TaskPriorityDistributionSkeleton } from "./task-priority-distribution-skeleton";

export function AnalyticsInsightsSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-10">
			<div className="lg:relative lg:col-span-7">
				<div className="lg:absolute lg:inset-0">
					<ProjectProgressSkeleton />
				</div>
			</div>

			<div className="lg:col-span-3">
				<TaskPriorityDistributionSkeleton />
			</div>
		</div>
	);
}
