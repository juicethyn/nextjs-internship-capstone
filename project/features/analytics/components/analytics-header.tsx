"use client";

import { CalendarRange, ChevronDown, FolderKanban } from "lucide-react";
import { useEffect } from "react";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	ANALYTICS_PERIODS,
	DEFAULT_ANALYTICS_PERIOD,
} from "@/features/analytics/constants";
import { useAnalyticsProjectOptions } from "@/features/analytics/hooks/use-analytics-project-options";
import { getPeriodLabel } from "@/features/analytics/lib/date-range";
import { useAnalyticsUIStore } from "@/features/analytics/store";
import type { AnalyticsPeriod } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

type AnalyticsHeaderProps = {
	workspaceSlug: string;
};

const ACTIVE_TRIGGER_STYLES =
	"border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary";

export function AnalyticsHeader({ workspaceSlug }: AnalyticsHeaderProps) {
	const projectId = useAnalyticsUIStore((state) => state.projectId);
	const period = useAnalyticsUIStore((state) => state.period);
	const includeArchived = useAnalyticsUIStore((state) => state.includeArchived);
	const setProjectId = useAnalyticsUIStore((state) => state.setProjectId);
	const setPeriod = useAnalyticsUIStore((state) => state.setPeriod);
	const setIncludeArchived = useAnalyticsUIStore(
		(state) => state.setIncludeArchived,
	);

	const { projects, isSuccess } = useAnalyticsProjectOptions({
		workspaceSlug,
		includeArchived,
	});

	const activeProject = projects.find((project) => project.id === projectId);

	// Turning archived off drops archived projects out of the option list. Left
	// selected, every query would come back empty with nothing on screen to
	// explain why, so the selection falls back to All Projects instead. Guarded
	// on isSuccess because the list is empty while the query is still loading.
	useEffect(() => {
		if (!isSuccess || !projectId) return;

		if (!projects.some((project) => project.id === projectId)) {
			setProjectId(null);
		}
	}, [isSuccess, projectId, projects, setProjectId]);

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Analytics</h1>

				<p className="text-sm text-muted-foreground">
					Workspace performance overview
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="lg"
							className={cn(
								"w-full sm:w-auto",
								period !== DEFAULT_ANALYTICS_PERIOD && ACTIVE_TRIGGER_STYLES,
							)}
						>
							<CalendarRange className="size-4" />

							<span className="truncate">{getPeriodLabel(period)}</span>

							<ChevronDown className="size-4 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuRadioGroup
							value={period}
							onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
						>
							{ANALYTICS_PERIODS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="lg"
							className={cn(
								"w-full sm:w-auto",
								activeProject && ACTIVE_TRIGGER_STYLES,
							)}
						>
							{activeProject ? (
								<WorkspaceAvatar
									name={activeProject.name}
									color={activeProject.color}
									size="xs"
								/>
							) : (
								<FolderKanban className="size-4" />
							)}

							<span className="max-w-36 truncate">
								{activeProject ? activeProject.name : "All Projects"}
							</span>

							<ChevronDown className="size-4 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuRadioGroup
							value={projectId ?? "all"}
							onValueChange={(value) =>
								setProjectId(value === "all" ? null : value)
							}
						>
							<DropdownMenuRadioItem value="all">
								All Projects
							</DropdownMenuRadioItem>

							{projects.map((project) => (
								<DropdownMenuRadioItem key={project.id} value={project.id}>
									<WorkspaceAvatar
										name={project.name}
										color={project.color}
										size="xs"
									/>

									<span className="truncate">{project.name}</span>
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<div
					className={cn(
						"flex h-9 w-full items-center justify-between gap-3 rounded-md border px-3 sm:w-auto sm:justify-start",
						includeArchived && ACTIVE_TRIGGER_STYLES,
					)}
				>
					<Label
						htmlFor="include-archived"
						className="cursor-pointer text-sm font-normal"
					>
						Include Archived
					</Label>

					<Switch
						id="include-archived"
						checked={includeArchived}
						onCheckedChange={setIncludeArchived}
					/>
				</div>
			</div>
		</div>
	);
}
