"use client";

import { formatEventTime } from "@/features/calendar/lib/calendar-utils";
import type { CalendarEvent } from "@/features/calendar/types";

type EventItemProps = {
	event: CalendarEvent;
	onSelect: (event: CalendarEvent) => void;
};

export function EventItem({ event, onSelect }: EventItemProps) {
	const time = formatEventTime(event);

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(event)}
				className="w-full rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-accent/50"
			>
				<div className="flex items-start gap-2">
					<span
						aria-hidden="true"
						className="mt-1 size-2 shrink-0 rounded-sm"
						style={{ backgroundColor: event.projectColor }}
					/>

					<div className="min-w-0 flex-1">
						<p className="truncate text-xs font-medium">{event.title}</p>

						<div className="mt-0.5 flex min-w-0 items-center gap-1.5">
							<p className="truncate text-[10px] text-muted-foreground">
								{time ? `${time} · ` : ""}
								{event.projectName}
							</p>
						</div>
					</div>
				</div>
			</button>
		</li>
	);
}
