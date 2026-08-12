"use client";

import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { getProjectTaskStats } from "@/lib/utils/project-stats";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
import { LabelBadge } from "../labels/label-badge";
import { ProjectStatusBadge } from "../project/project-status-badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { WorkspaceAvatar } from "../workspace-avatar";
import { MemberAvatarStack } from "./member-avatar-stack";

type ProjectDetailsDialogProps = {
	project: ProjectDetail;
};

export function ProjectDetailsDialog({ project }: ProjectDetailsDialogProps) {
	const isProjectDetailsOpen = useUIStore(
		(state) => state.isProjectDetailsOpen,
	);
	const setProjectDetailsOpen = useUIStore(
		(state) => state.setProjectDetailsOpen,
	);

	const taskStats = getProjectTaskStats(project.lists);
	const description = project.description?.trim() || null;

	return (
		<Dialog open={isProjectDetailsOpen} onOpenChange={setProjectDetailsOpen}>
			<DialogContent className="min-w-0 overflow-hidden sm:max-w-lg">
				{/* Header */}
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="text-base">Project Details</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						View the project information, progress, labels, dates, and members.
					</DialogDescription>
				</DialogHeader>

				<div className="board-scrollbar max-h-[60vh] min-w-0 overflow-y-auto">
					<div className="min-w-0 space-y-5 pr-3">
						{/* Project Identity */}
						<section className="flex min-w-0 justfy-between items-center gap-3">
							<WorkspaceAvatar
								name={project.name}
								color={project.color}
								size="sm"
							/>

							<div className="min-w-0 flex-1">
								<div className="flex min-w-0 items-center gap-2">
									<h2 className="min-w-0 wrap-break-word text-sm font-semibold leading-tight">
										{project.name}
									</h2>

									<ProjectStatusBadge status={project.status} />
								</div>
							</div>
						</section>

						<Separator />

						{/* Description */}
						<section className="min-w-0 space-y-1.5">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Description
							</h3>

							<p
								className={cn(
									"min-w-0 break-all text-sm leading-relaxed",
									description ? "" : "italic text-muted-foreground opacity-70",
								)}
							>
								{description ?? "No description yet"}
							</p>
						</section>

						<Separator />

						{/* Progress */}
						<section className="min-w-0 space-y-2">
							<div className="flex min-w-0 items-center justify-between gap-3">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Progress
								</h3>

								<span className="shrink-0 text-xs font-medium">
									{taskStats.progress}%
								</span>
							</div>

							<div className="h-1.5 overflow-hidden rounded-full bg-secondary">
								<div
									className="h-full rounded-full transition-[width] duration-300"
									style={{
										width: `${taskStats.progress}%`,
										backgroundColor: project.color,
									}}
								/>
							</div>

							<p className="wrap-break-word text-xs text-muted-foreground">
								{taskStats.completedTasks} of {taskStats.totalTasks} tasks
								completed
							</p>
						</section>

						<Separator />

						{/* Dates */}
						<section className="grid min-w-0 grid-cols-2 gap-4">
							<div className="min-w-0 space-y-1">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Start date
								</h3>

								<p className="wrap-break-word text-sm">
									{formatProjectDate(project.startDate, "Not set")}
								</p>
							</div>

							<div className="min-w-0 space-y-1">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Due date
								</h3>

								<p className="wrap-break-word text-sm">
									{formatProjectDate(project.dueDate, "Not set")}
								</p>
							</div>
						</section>

						<Separator />

						{/* Labels */}
						<section className="min-w-0 space-y-2">
							<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Labels
							</h3>

							{project.projectLabels.length > 0 ? (
								<div className="flex min-w-0 flex-wrap items-center gap-1.5">
									{project.projectLabels.map(({ workspaceLabel }) => (
										<LabelBadge
											key={workspaceLabel.id}
											name={workspaceLabel.name}
											color={workspaceLabel.color}
										/>
									))}
								</div>
							) : (
								<p className="text-sm italic text-muted-foreground opacity-70">
									No labels
								</p>
							)}
						</section>

						<Separator />

						{/* Members */}
						<section className="min-w-0 space-y-2">
							<h3 className="wrap-break-word text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Members ({project.members.length})
							</h3>

							<MemberAvatarStack
								members={project.members.map((member) => member.user)}
								max={8}
							/>
						</section>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
