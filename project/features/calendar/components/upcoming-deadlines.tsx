"use client";

import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	countByPriority,
	groupDeadlinesByDay,
	UPCOMING_WINDOW_DAYS,
} from "@/features/calendar/lib/calendar-utils";
import type { CalendarDeadline } from "@/features/calendar/types";
import {
	PRIORITY_ICON_STYLES,
	PRIORITY_LABELS,
} from "@/features/projects/kanban/components/priority-badge";
import { cn } from "@/lib/utils";
import { DeadlineItem } from "./deadline-item";

const GROUP_LABEL_STYLES: Record<string, string> = {
	Today: "text-primary",
	Tomorrow: "text-amber-600 dark:text-amber-400",
};

type UpcomingDeadlinesProps = {
	deadlines: CalendarDeadline[];
	anchorDate: Date | null;
	isLoading?: boolean;
	onSelect: (deadline: CalendarDeadline) => void;
	onClearAnchor: () => void;
};

export function UpcomingDeadlines({
	deadlines,
	anchorDate,
	isLoading = false,
	onSelect,
	onClearAnchor,
}: UpcomingDeadlinesProps) {
	const groups = groupDeadlinesByDay(deadlines);

	const counts = countByPriority(deadlines);

	return (
		<aside className="flex w-full shrink-0 flex-col border-t bg-sidebar lg:w-70 lg:overflow-hidden lg:border-t-0 lg:border-l">
			<div className="flex shrink-0 items-start justify-between gap-2 border-b px-4 pt-5 pb-3">
				<div className="min-w-0">
					<h2 className="text-[13px] font-semibold">Upcoming Deadlines</h2>

					<p className="mt-0.5 truncate text-[11px] text-muted-foreground">
						{anchorDate
							? `${UPCOMING_WINDOW_DAYS} days from ${format(anchorDate, "MMM d")}`
							: `Next ${UPCOMING_WINDOW_DAYS} days`}
					</p>
				</div>

				{anchorDate && (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onClearAnchor}
						aria-label="Clear selected date"
					>
						<X />
					</Button>
				)}
			</div>

			<div className="max-h-96 space-y-4 overflow-y-auto px-3 py-3 lg:max-h-none lg:min-h-0 lg:flex-1">
				{isLoading ? (
					<div className="space-y-1.5">
						{[0, 1, 2, 3].map((row) => (
							<Skeleton key={row} className="h-14 rounded-lg" />
						))}
					</div>
				) : groups.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						No tasks in the next {UPCOMING_WINDOW_DAYS} days
					</p>
				) : (
					groups.map((group) => (
						<div key={group.label}>
							<p
								className={cn(
									"mb-1.5 text-[10px] font-semibold uppercase tracking-widest",
									GROUP_LABEL_STYLES[group.label] ?? "text-muted-foreground",
								)}
							>
								{group.label}
							</p>

							<ul className="space-y-1.5">
								{group.deadlines.map((deadline) => (
									<DeadlineItem
										key={deadline.id}
										deadline={deadline}
										onSelect={onSelect}
									/>
								))}
							</ul>
						</div>
					))
				)}
			</div>

			<div className="shrink-0 space-y-2 border-t px-4 py-3">
				<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					This period
				</p>

				{counts.map(({ priority, total }) => (
					<div key={priority} className="flex items-center gap-2">
						<span
							aria-hidden="true"
							className={cn(
								"size-2 shrink-0 rounded-full bg-current",
								PRIORITY_ICON_STYLES[priority],
							)}
						/>

						<span className="flex-1 text-xs text-muted-foreground">
							{PRIORITY_LABELS[priority]}
						</span>

						<span className="text-xs font-medium tabular-nums">{total}</span>
					</div>
				))}
			</div>
		</aside>
	);
}
