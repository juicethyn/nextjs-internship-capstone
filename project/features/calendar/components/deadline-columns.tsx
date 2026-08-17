"use client";

import { isSameLocalDay } from "@/features/calendar/lib/calendar-utils";
import type { CalendarEvent } from "@/features/calendar/types";
import { cn } from "@/lib/utils";
import { TaskPill } from "./task-pill";

const SHORT_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FULL_DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

type DeadlineColumnsProps = {
	days: Date[];
	events: CalendarEvent[];
	onSelectEvent?: (event: CalendarEvent) => void;
};

export function DeadlineColumns({
	days,
	events,
	onSelectEvent,
}: DeadlineColumnsProps) {
	const today = new Date();

	const names = days.length === 1 ? FULL_DAY_NAMES : SHORT_DAY_NAMES;

	const gridStyle = {
		gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
	};

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="grid shrink-0 border-b" style={gridStyle}>
				{days.map((day) => {
					const isToday = isSameLocalDay(day, today);

					return (
						<div
							key={day.toISOString()}
							className="border-r py-3 text-center last:border-r-0"
						>
							<p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
								{names[day.getDay()]}
							</p>

							<p
								className={cn(
									"mx-auto mt-0.5 flex size-9 items-center justify-center rounded-full text-lg font-semibold",
									isToday && "bg-primary text-primary-foreground",
								)}
							>
								{day.getDate()}
							</p>
						</div>
					);
				})}
			</div>

			<div className="grid min-h-0 flex-1 overflow-auto" style={gridStyle}>
				{days.map((day) => {
					const dayEvents = events.filter((event) =>
						isSameLocalDay(event.start, day),
					);

					return (
						<div
							key={day.toISOString()}
							className={cn(
								"flex flex-col gap-1.5 border-r p-2 last:border-r-0",
								isSameLocalDay(day, today) && "bg-primary/5",
							)}
						>
							{dayEvents.map((event) => (
								<TaskPill
									key={event.id}
									deadline={event}
									showProject
									onSelect={
										onSelectEvent ? () => onSelectEvent(event) : undefined
									}
								/>
							))}

							{dayEvents.length === 0 && (
								<span className="pt-4 text-center text-[11px] text-muted-foreground/30">
									—
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
