"use client";

import { isSameLocalDay } from "@/features/calendar/lib/calendar-utils";
import type { CalendarItem } from "@/features/calendar/types";
import { cn } from "@/lib/utils";
import { EventChip } from "./event-chip";
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
	events: CalendarItem[];
	anchorDate?: Date | null;
	onSelectEvent?: (event: CalendarItem) => void;
	onSelectDay?: (day: Date) => void;
};

export function DeadlineColumns({
	days,
	events,
	anchorDate,
	onSelectEvent,
	onSelectDay,
}: DeadlineColumnsProps) {
	const today = new Date();

	const isSelected = (day: Date) =>
		Boolean(anchorDate && isSameLocalDay(day, anchorDate));

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
							className={cn(
								"border-r py-3 text-center last:border-r-0",
								isSelected(day) &&
									"bg-primary/10 ring-2 ring-primary ring-inset",
							)}
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
						// biome-ignore lint/a11y/noStaticElementInteractions: day cells mirror the month grid, where react-big-calendar owns the same interaction
						// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the same dates through the toolbar navigation
						<div
							key={day.toISOString()}
							onClick={() => onSelectDay?.(day)}
							className={cn(
								"flex flex-col gap-1.5 border-r p-2 last:border-r-0",
								onSelectDay && "cursor-pointer",
								isSameLocalDay(day, today) && "bg-primary/5",
								isSelected(day) &&
									"bg-primary/10 ring-2 ring-primary ring-inset",
							)}
						>
							{dayEvents.map((item) =>
								item.kind === "event" ? (
									<EventChip
										key={item.id}
										event={item.event}
										showProject
										onSelect={
											onSelectEvent ? () => onSelectEvent(item) : undefined
										}
									/>
								) : (
									<TaskPill
										key={item.id}
										deadline={item.deadline}
										showProject
										onSelect={
											onSelectEvent ? () => onSelectEvent(item) : undefined
										}
									/>
								),
							)}

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
