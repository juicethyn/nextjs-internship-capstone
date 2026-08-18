"use client";

import { formatEventTime } from "@/features/calendar/lib/calendar-utils";
import type { CalendarEvent } from "@/features/calendar/types";
import { cn } from "@/lib/utils";

type EventChipProps = {
	event: CalendarEvent;
	showProject?: boolean;
};

export function EventChip({ event, showProject = false }: EventChipProps) {
	const time = formatEventTime(event);

	return (
		<div
			className={cn(
				"w-full overflow-hidden rounded text-left text-white transition-opacity hover:opacity-90",
				showProject ? "px-2 py-1.5" : "px-1.5 py-0.5",
			)}
			style={{ backgroundColor: event.projectColor }}
		>
			<p
				className={cn(
					"truncate font-semibold",
					showProject ? "text-[11px]" : "text-[10px]",
				)}
			>
				{time && <span className="font-normal opacity-80">{time} </span>}

				{event.title}
			</p>

			{showProject && (
				<p className="mt-0.5 truncate text-[10px] opacity-80">
					{event.projectName}
				</p>
			)}
		</div>
	);
}
