"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TaskActivityItem as TaskActivityEntry } from "@/features/projects/kanban/hooks/use-task-activity";
import { taskActivityLines } from "@/features/projects/kanban/lib/task-activity-text";
import { formatCommentTimestamp } from "@/lib/date-formatter";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type TaskActivityItemProps = {
	activity: TaskActivityEntry;
};

export function TaskActivityItem({ activity }: TaskActivityItemProps) {
	const actor = activity.actor;
	const name = actor ? memberDisplayName(actor) : "Someone";

	const lines = taskActivityLines(activity.action, activity.metadata);

	return (
		<div className="flex min-w-0 gap-2.5">
			<Avatar className="mt-0.5 size-7 shrink-0 opacity-70">
				{actor?.imageUrl && <AvatarImage src={actor.imageUrl} alt={name} />}

				<AvatarFallback className="text-[10px]">
					{actor ? getInitials(actor.firstName, actor.lastName) : "?"}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<span className="min-w-0 truncate text-xs font-medium">{name}</span>

					<span className="shrink-0 text-[11px] text-muted-foreground">
						{formatCommentTimestamp(activity.createdAt)}
					</span>
				</div>

				{lines.map((line) => (
					<div key={line.summary} className="mt-0.5 min-w-0">
						<p className="min-w-0 wrap-break-word text-sm text-muted-foreground">
							{line.summary}
						</p>

						{line.detail && (
							<p className="min-w-0 wrap-break-word text-xs text-muted-foreground/80">
								{line.detail}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
