"use client";

import { isCompleted } from "@/features/calendar/lib/calendar-utils";
import type { CalendarDeadline } from "@/features/calendar/types";
import { PRIORITY_ICON_STYLES } from "@/features/projects/kanban/components/priority-badge";
import { cn } from "@/lib/utils";

type DeadlineItemProps = {
	deadline: CalendarDeadline;
	onSelect: (deadline: CalendarDeadline) => void;
};

export function DeadlineItem({ deadline, onSelect }: DeadlineItemProps) {
	const done = isCompleted(deadline);

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(deadline)}
				className={cn(
					"w-full rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-accent/50",
					done && "opacity-50",
				)}
			>
				<div className="flex items-start gap-2">
					<span
						aria-hidden="true"
						className={cn(
							"mt-1 size-2 shrink-0 rounded-full bg-current",
							PRIORITY_ICON_STYLES[deadline.priority],
						)}
					/>

					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"truncate text-xs font-medium",
								done && "line-through",
							)}
						>
							{deadline.title}
						</p>

						<div className="mt-0.5 flex min-w-0 items-center gap-1.5">
							<span
								aria-hidden="true"
								className="size-2 shrink-0 rounded-sm"
								style={{ backgroundColor: deadline.projectColor }}
							/>

							<p className="truncate text-[10px] text-muted-foreground">
								{deadline.projectName}
							</p>
						</div>
					</div>
				</div>
			</button>
		</li>
	);
}
