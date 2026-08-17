"use client";

import Link from "next/link";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import type { ContinueWorkingProject } from "@/features/dashboard/hooks/use-continue-working";
import { formatProjectDate, isOverdue } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";

type ContinueWorkingItemProps = {
	project: ContinueWorkingProject;
	workspaceSlug: string;
};

function remainingLabel(total: number, remaining: number) {
	if (total === 0) return "No tasks yet";

	return `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`;
}

export function ContinueWorkingItem({
	project,
	workspaceSlug,
}: ContinueWorkingItemProps) {
	const overdue = isOverdue(project.dueDate);

	return (
		<Link
			href={`/w/${workspaceSlug}/projects/${project.slug}`}
			className="block space-y-2.5 rounded-lg border p-3 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
		>
			<div className="flex min-w-0 items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2">
					<WorkspaceAvatar
						name={project.name}
						color={project.color}
						size="xs"
					/>

					<span className="min-w-0 truncate text-sm font-medium">
						{project.name}
					</span>
				</div>

				{project.dueDate && (
					<span
						className={cn(
							"shrink-0 text-[11px] text-muted-foreground",
							overdue && "font-medium text-destructive",
						)}
					>
						{formatProjectDate(project.dueDate)}
					</span>
				)}
			</div>

			<div className="flex items-center gap-2">
				<div
					className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
					role="progressbar"
					aria-label={`${project.name} progress`}
					aria-valuenow={project.progress}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<div
						className="h-full rounded-full transition-[width] duration-300"
						style={{
							width: `${project.progress}%`,
							backgroundColor: project.color,
						}}
					/>
				</div>

				<span className="shrink-0 text-[11px] font-medium tabular-nums">
					{project.progress}%
				</span>
			</div>

			<p className="text-xs text-muted-foreground">
				{remainingLabel(project.total, project.remaining)}
			</p>
		</Link>
	);
}
