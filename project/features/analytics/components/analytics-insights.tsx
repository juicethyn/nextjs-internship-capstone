"use client";

import { ProjectProgress } from "./project-progress";
import { TaskPriorityDistribution } from "./task-priority-distribution";

type AnalyticsInsightsProps = {
	workspaceSlug: string;
};

export function AnalyticsInsights({ workspaceSlug }: AnalyticsInsightsProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-10">
			<div className="lg:relative lg:col-span-7">
				<div className="lg:absolute lg:inset-0">
					<ProjectProgress workspaceSlug={workspaceSlug} />
				</div>
			</div>

			<div className="lg:col-span-3">
				<TaskPriorityDistribution workspaceSlug={workspaceSlug} />
			</div>
		</div>
	);
}
