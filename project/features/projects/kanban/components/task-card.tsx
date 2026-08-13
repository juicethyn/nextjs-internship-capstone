"use client";

import { CalendarRange, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LabelBadge } from "@/features/labels/components/label-badge";
import { useProjectUIStore } from "@/features/projects/store";
import type { ProjectDetail } from "@/features/projects/types";
import { formatProjectDate, isOverdue } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./priority-badge";

type KanbanTask = ProjectDetail["lists"][number]["tasks"][number];

const MAX_VISIBLE_LABELS = 2;

type TaskCardProps = {
	task: Pick<KanbanTask, "id" | "title"> &
		Partial<Omit<KanbanTask, "id" | "title">>;
	isPending?: boolean;
	isDone?: boolean;
};

export function TaskCard({
	task,
	isPending = false,
	isDone = false,
}: TaskCardProps) {
	const openTaskDetails = useProjectUIStore((state) => state.openTaskDetails);

	const overdue = !isDone && isOverdue(task.dueDate);

	const assignee = task.assignee ?? null;
	const labels = task.taskLabels ?? [];
	const commentCount = task.comments?.length ?? 0;

	const visibleLabels = labels.slice(0, MAX_VISIBLE_LABELS);
	const hiddenLabels = labels.slice(MAX_VISIBLE_LABELS);
	const priority = task.priority ?? "none";
	const showPriority = priority !== "none";

	const assigneeName = assignee
		? `${assignee.firstName} ${assignee.lastName}`.trim()
		: "";

	const hasMeta = showPriority || Boolean(task.dueDate) || commentCount > 0;

	return (
		<button
			type="button"
			disabled={isPending}
			onClick={() => openTaskDetails(task.id)}
			className={cn(
				"block w-full space-y-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
				isPending && "opacity-60",
			)}
		>
			<div className="flex items-start gap-2">
				<p className="min-w-0 flex-1 wrap-break-word text-sm font-medium">
					{task.title}
				</p>

				{assignee && (
					<Avatar className="size-6 shrink-0" title={assigneeName}>
						{assignee.imageUrl && (
							<AvatarImage src={assignee.imageUrl} alt={assigneeName} />
						)}

						<AvatarFallback className="text-[10px]">
							{`${assignee.firstName.charAt(0)}${assignee.lastName.charAt(0)}`.toUpperCase()}
						</AvatarFallback>
					</Avatar>
				)}
			</div>

			{labels.length > 0 && (
				<div className="flex min-w-0 items-center gap-1.5">
					{visibleLabels.map(({ taskLabel }) => (
						<LabelBadge
							key={taskLabel.id}
							name={taskLabel.name}
							color={taskLabel.color}
							className="min-w-0 text-[10px]"
						/>
					))}

					{hiddenLabels.length > 0 && (
						<span
							title={hiddenLabels
								.map(({ taskLabel }) => taskLabel.name)
								.join(", ")}
							className="shrink-0 rounded-full border border-border px-1.5 py-1 text-[10px] font-medium text-muted-foreground"
						>
							+{hiddenLabels.length}
						</span>
					)}
				</div>
			)}

			{hasMeta && (
				<div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
					{showPriority ? <PriorityBadge priority={priority} /> : <span />}

					<div className="flex min-w-0 items-center gap-3">
						{task.dueDate && (
							<span
								title={overdue ? "Overdue" : undefined}
								className={cn(
									"inline-flex min-w-0 items-center gap-1",
									overdue && "font-medium text-destructive",
								)}
							>
								<CalendarRange className="size-3 shrink-0" />
								<span className="truncate">
									{formatProjectDate(task.dueDate)}
								</span>

								{overdue && <span className="sr-only">Overdue</span>}
							</span>
						)}

						{commentCount > 0 && (
							<span className="inline-flex items-center gap-1">
								<MessageSquare className="size-3 shrink-0" />
								{commentCount}
							</span>
						)}
					</div>
				</div>
			)}
		</button>
	);
}
