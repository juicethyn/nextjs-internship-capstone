"use client";

import { TriangleAlert } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useWorkspaceHealth } from "@/features/dashboard/hooks/use-workspace-health";
import { distributePercentages } from "@/features/dashboard/lib/percentages";
import {
	STATUS_CHART_CONFIG,
	type StatusKey,
	TaskStatusDonut,
} from "./task-status-donut";
import { WorkspaceHealthSkeleton } from "./workspace-health-skeleton";

type WorkspaceHealthProps = {
	workspaceSlug: string;
};

const STATUS_ORDER: StatusKey[] = ["todo", "in_progress", "done"];

export function WorkspaceHealth({ workspaceSlug }: WorkspaceHealthProps) {
	const { data, isLoading, isError } = useWorkspaceHealth({ workspaceSlug });

	if (isLoading) {
		return <WorkspaceHealthSkeleton />;
	}

	if (isError || !data) {
		return (
			<Card className="h-full">
				<CardHeader className="border-b pb-3">
					<CardTitle>Workspace Health</CardTitle>
				</CardHeader>

				<CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
					<TriangleAlert className="size-4 shrink-0" />
					<span>Couldn't load workspace health.</span>
				</CardContent>
			</Card>
		);
	}

	const counts: Record<StatusKey, number> = {
		todo: data.todo,
		in_progress: data.inProgress,
		done: data.done,
	};

	const percentages = distributePercentages(
		STATUS_ORDER.map((status) => counts[status]),
	);

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<CardTitle>Workspace Health</CardTitle>

				<CardDescription>Task Status Distribution</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5">
				<TaskStatusDonut counts={counts} total={data.total} />

				<div className="space-y-2">
					{STATUS_ORDER.map((status, index) => (
						<div
							key={status}
							className="flex items-center justify-between gap-3 text-sm"
						>
							<div className="flex min-w-0 items-center gap-2">
								<span
									aria-hidden="true"
									className="size-2.5 shrink-0 rounded-xs"
									style={{ backgroundColor: STATUS_CHART_CONFIG[status].color }}
								/>

								<span className="truncate text-muted-foreground">
									{STATUS_CHART_CONFIG[status].label}
								</span>
							</div>

							<div className="flex shrink-0 items-center gap-2 tabular-nums">
								<span className="font-medium">{counts[status]}</span>
								<span className="text-xs text-muted-foreground">
									{percentages[index]}%
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="space-y-3">
					{STATUS_ORDER.map((status, index) => (
						<div
							key={status}
							className="h-1.5 overflow-hidden rounded-full bg-secondary"
							role="progressbar"
							aria-label={`${STATUS_CHART_CONFIG[status].label} share of tasks`}
							aria-valuenow={percentages[index]}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="h-full rounded-full transition-[width] duration-300"
								style={{
									width: `${percentages[index]}%`,
									backgroundColor: STATUS_CHART_CONFIG[status].color,
								}}
							/>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
