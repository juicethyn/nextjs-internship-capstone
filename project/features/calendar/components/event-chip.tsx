"use client";

import { formatEventTime } from "@/features/calendar/lib/calendar-utils";
import type { CalendarEvent } from "@/features/calendar/types";
import { cn } from "@/lib/utils";

type EventChipProps = {
	event: CalendarEvent;
	showProject?: boolean;
	onSelect?: (event: CalendarEvent) => void;
};

export function EventChip({
	event,
	showProject = false,
	onSelect,
}: EventChipProps) {
	const time = formatEventTime(event);

	const className = cn(
		"w-full overflow-hidden rounded text-left text-white transition-opacity hover:opacity-90",
		showProject ? "px-2 py-1.5" : "px-1.5 py-0.5",
	);

	const style = { backgroundColor: event.projectColor };

	const content = (
		<>
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
		</>
	);

	if (!onSelect) {
		return (
			<div className={className} style={style}>
				{content}
			</div>
		);
	}

	return (
		<button
			type="button"
			className={className}
			style={style}
			onClick={(clickEvent) => {
				clickEvent.stopPropagation();
				onSelect(event);
			}}
		>
			{content}
		</button>
	);
}
