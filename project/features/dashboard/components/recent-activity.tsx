"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivity } from "@/features/dashboard/hooks/use-recent-activity";
import { ActivityItem } from "./activity-item";
import { RecentActivitySkeleton } from "./recent-activity-skeleton";

type RecentActivityProps = {
	workspaceSlug: string;
};

export function RecentActivity({ workspaceSlug }: RecentActivityProps) {
	const { data, isLoading, isError } = useRecentActivity({ workspaceSlug });

	if (isLoading) {
		return <RecentActivitySkeleton />;
	}

	return (
		<Card className="flex h-full flex-col overflow-hidden">
			<CardHeader className="border-b pb-3">
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>

			<CardContent className="min-h-0 flex-1 overflow-y-auto">
				{isError || !data ? (
					<div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
						<TriangleAlert className="size-4 shrink-0" />
						<span>Couldn't load recent activity.</span>
					</div>
				) : data.length === 0 ? (
					<p className="py-6 text-sm text-muted-foreground">
						No project activity yet. Create a project or move a task to get
						started.
					</p>
				) : (
					<ul>
						{data.map((activity) => (
							<ActivityItem key={activity.id} activity={activity} />
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
