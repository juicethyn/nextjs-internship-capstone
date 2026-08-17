"use client";

import Link from "next/link";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import type { MyTaskItemData } from "@/features/dashboard/hooks/use-my-tasks";
import { PriorityBadge } from "@/features/projects/kanban/components/priority-badge";
import { formatProjectDate, isOverdue } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";

type MyTaskItemProps = {
	task: MyTaskItemData;
	workspaceSlug: string;
};

export function MyTaskItem({ task, workspaceSlug }: MyTaskItemProps) {
	const overdue = isOverdue(task.dueDate);

	return (
		<li className="border-b last:border-b-0">
			<Link
				href={`/w/${workspaceSlug}/projects/${task.projectSlug}`}
				className="-mx-2 block rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
			>
				<div className="flex min-w-0 items-start justify-between gap-3">
					<p className="min-w-0 truncate text-sm font-medium">{task.title}</p>

					{task.priority !== "none" && (
						<PriorityBadge priority={task.priority} className="shrink-0" />
					)}
				</div>

				<div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
					<WorkspaceAvatar
						name={task.projectName}
						color={task.projectColor}
						size="xs"
					/>

					<span className="min-w-0 truncate">{task.projectName}</span>

					<span aria-hidden="true">•</span>

					<span
						className={cn(
							"shrink-0",
							overdue && "font-medium text-destructive",
						)}
					>
						{formatProjectDate(task.dueDate)}
					</span>
				</div>
			</Link>
		</li>
	);
}
