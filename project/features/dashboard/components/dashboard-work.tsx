"use client";

import { ContinueWorking } from "./continue-working";
import { MyTasks } from "./my-tasks";

type DashboardWorkProps = {
	workspaceSlug: string;
};

export function DashboardWork({ workspaceSlug }: DashboardWorkProps) {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<MyTasks workspaceSlug={workspaceSlug} />

			<ContinueWorking workspaceSlug={workspaceSlug} />
		</div>
	);
}
