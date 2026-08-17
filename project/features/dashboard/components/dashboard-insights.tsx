"use client";

import { RecentActivity } from "./recent-activity";
import { WorkspaceHealth } from "./workspace-health";

type DashboardInsightsProps = {
	workspaceSlug: string;
};

export function DashboardInsights({ workspaceSlug }: DashboardInsightsProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-10">
			<div className="lg:relative lg:col-span-7">
				<div className="lg:absolute lg:inset-0">
					<RecentActivity workspaceSlug={workspaceSlug} />
				</div>
			</div>

			<div className="lg:col-span-3">
				<WorkspaceHealth workspaceSlug={workspaceSlug} />
			</div>
		</div>
	);
}
