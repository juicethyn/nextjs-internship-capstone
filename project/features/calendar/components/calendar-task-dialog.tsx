"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarUIStore } from "@/features/calendar/store";
import { useProjectDetail } from "@/features/projects/hooks/use-project-detail";
import { TaskDetailsDialog } from "@/features/projects/kanban/components/task-details-dialog";
import { useProjectUIStore } from "@/features/projects/store";

type CalendarTaskDialogProps = {
	workspaceSlug: string;
};

export function CalendarTaskDialog({ workspaceSlug }: CalendarTaskDialogProps) {
	const openTaskId = useProjectUIStore((state) => state.openTaskId);
	const closeTaskDetails = useProjectUIStore((state) => state.closeTaskDetails);

	const projectSlug = useCalendarUIStore((state) => state.openTaskProjectSlug);

	const { project, isLoading } = useProjectDetail({
		workspaceSlug,
		projectSlug: openTaskId ? projectSlug : null,
	});

	const entry = project?.lists
		.map((list) => ({
			list,
			task: list.tasks.find((task) => task.id === openTaskId),
		}))
		.find((candidate) => candidate.task);

	const task = entry?.task ?? null;

	if (openTaskId && !task) {
		return (
			<Dialog
				open
				onOpenChange={(open) => {
					if (!open) closeTaskDetails();
				}}
			>
				<DialogContent className="sm:max-w-3xl">
					<DialogHeader>
						<DialogTitle>
							{isLoading ? "Loading task…" : "Task unavailable"}
						</DialogTitle>

						<DialogDescription>
							{isLoading
								? "Fetching the project this task belongs to."
								: "This task could not be found. It may have been deleted."}
						</DialogDescription>
					</DialogHeader>

					{isLoading && (
						<div className="space-y-3">
							<Skeleton className="h-8 w-2/3" />
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-8 w-1/3" />
						</div>
					)}
				</DialogContent>
			</Dialog>
		);
	}

	if (!task || !project || !projectSlug) return null;

	return (
		<TaskDetailsDialog
			task={task}
			members={project.members}
			listName={entry?.list.name ?? ""}
			workspaceSlug={workspaceSlug}
			projectSlug={projectSlug}
		/>
	);
}
