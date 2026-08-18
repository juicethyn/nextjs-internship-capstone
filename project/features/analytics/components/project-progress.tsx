"use client";

import { TriangleAlert } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PROJECT_PROGRESS_LIMIT } from "@/features/analytics/constants";
import { useProjectProgress } from "@/features/analytics/hooks/use-project-progress";
import { useAnalyticsFilters } from "@/features/analytics/store";
import { ProjectProgressChart } from "./project-progress-chart";
import { ProjectProgressSkeleton } from "./project-progress-skeleton";

type ProjectProgressProps = {
	workspaceSlug: string;
};

function getDescription(data?: {
	mode: "projects" | "statuses";
	hiddenProjects: number;
}) {
	if (!data) return "Completion by project";

	if (data.mode === "statuses") return "Task status breakdown";

	if (data.hiddenProjects > 0) {
		return `Top ${PROJECT_PROGRESS_LIMIT} by completion · ${data.hiddenProjects} more hidden`;
	}

	return "Completion by project";
}

export function ProjectProgress({ workspaceSlug }: ProjectProgressProps) {
	const filters = useAnalyticsFilters();

	const { data, isLoading, isError } = useProjectProgress({
		workspaceSlug,
		filters,
	});

	if (isLoading) {
		return <ProjectProgressSkeleton />;
	}

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<CardTitle>Project Progress</CardTitle>

				<CardDescription>{getDescription(data)}</CardDescription>
			</CardHeader>

			<CardContent className="flex min-h-0 flex-1 flex-col">
				{isError || !data ? (
					<div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
						<TriangleAlert className="size-4 shrink-0" />
						<span>Couldn't load project progress.</span>
					</div>
				) : data.rows.length === 0 ? (
					<p className="py-6 text-sm text-muted-foreground">
						{data.mode === "statuses"
							? "This project has no tasks yet."
							: "No projects with tasks yet."}
					</p>
				) : (
					<ProjectProgressChart rows={data.rows} mode={data.mode} />
				)}
			</CardContent>
		</Card>
	);
}
