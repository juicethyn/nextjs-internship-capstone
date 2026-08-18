"use client";

import {
	Archive,
	CalendarRange,
	ChevronDown,
	FolderKanban,
} from "lucide-react";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalyticsProjectOptions } from "@/features/analytics/hooks/use-analytics-project-options";
import { useAnalyticsUIStore } from "@/features/analytics/store";
import { cn } from "@/lib/utils";

type AnalyticsHeaderProps = {
	workspaceSlug: string;
};

const ACTIVE_TRIGGER_STYLES =
	"border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary";

export function AnalyticsHeader({ workspaceSlug }: AnalyticsHeaderProps) {
	const projectId = useAnalyticsUIStore((state) => state.projectId);
	const setProjectId = useAnalyticsUIStore((state) => state.setProjectId);

	const { projects } = useAnalyticsProjectOptions({ workspaceSlug });

	const activeProject = projects.find((project) => project.id === projectId);

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Analytics</h1>

				<p className="text-sm text-muted-foreground">
					Workspace performance overview
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<CalendarRange className="size-4" />
					Date Range
				</Button>

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

				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<Archive className="size-4" />
					Include Archived
				</Button>
			</div>
		</div>
	);
}
