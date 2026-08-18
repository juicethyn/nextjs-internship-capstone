"use client";

import { TriangleAlert } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTaskPriorityDistribution } from "@/features/analytics/hooks/use-task-priority-distribution";
import { useAnalyticsFilters } from "@/features/analytics/store";
import { distributePercentages } from "@/features/dashboard/lib/percentages";
import { TaskPriorityDistributionSkeleton } from "./task-priority-distribution-skeleton";
import {
	PRIORITY_CHART_CONFIG,
	type PriorityKey,
	TaskPriorityDonut,
} from "./task-priority-donut";

type TaskPriorityDistributionProps = {
	workspaceSlug: string;
};

const PRIORITY_ORDER: PriorityKey[] = ["high", "medium", "low", "none"];

export function TaskPriorityDistribution({
	workspaceSlug,
}: TaskPriorityDistributionProps) {
	const filters = useAnalyticsFilters();

	const { data, isLoading, isError } = useTaskPriorityDistribution({
		workspaceSlug,
		filters,
	});

	if (isLoading) {
		return <TaskPriorityDistributionSkeleton />;
	}

	if (isError || !data) {
		return (
			<Card className="h-full">
				<CardHeader className="border-b pb-3">
					<CardTitle>Task Priority Distribution</CardTitle>
				</CardHeader>

				<CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
					<TriangleAlert className="size-4 shrink-0" />
					<span>Couldn't load task priority distribution.</span>
				</CardContent>
			</Card>
		);
	}

	const counts: Record<PriorityKey, number> = {
		high: data.high,
		medium: data.medium,
		low: data.low,
		none: data.none,
	};

	const percentages = distributePercentages(
		PRIORITY_ORDER.map((priority) => counts[priority]),
	);

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<CardTitle>Task Priority Distribution</CardTitle>

				<CardDescription>Tasks by priority level</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5">
				<TaskPriorityDonut counts={counts} total={data.total} />

				<div className="space-y-2.5">
					{PRIORITY_ORDER.map((priority, index) => (
						<div key={priority} className="flex items-center gap-2.5 text-sm">
							<span className="w-14 shrink-0 truncate text-muted-foreground">
								{PRIORITY_CHART_CONFIG[priority].label}
							</span>

							<span className="w-5 shrink-0 text-right font-medium tabular-nums">
								{counts[priority]}
							</span>

							<div
								className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary"
								role="progressbar"
								aria-label={`${PRIORITY_CHART_CONFIG[priority].label} share of tasks`}
								aria-valuenow={percentages[index]}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								<div
									className="h-full rounded-full transition-[width] duration-300"
									style={{
										width: `${percentages[index]}%`,
										backgroundColor: PRIORITY_CHART_CONFIG[priority].color,
									}}
								/>
							</div>

							<span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
								{percentages[index]}%
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
