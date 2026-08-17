"use client";

import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import {
	Calendar,
	type DateHeaderProps,
	dateFnsLocalizer,
	type EventProps,
	type HeaderProps,
	type ShowMoreProps,
} from "react-big-calendar";
import { useCalendarUIStore } from "@/features/calendar/store";
import type {
	CalendarEvent,
	CalendarViewMode,
} from "@/features/calendar/types";
import { cn } from "@/lib/utils";
import { DeadlineWeekView } from "./deadline-week-view";
import { TaskPill } from "./task-pill";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/features/calendar/calendar.css";

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales: { "en-US": enUS },
});

function MonthHeader({ label }: HeaderProps) {
	return (
		<div className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
			{label.slice(0, 3)}
		</div>
	);
}

function MonthDateHeader({ date, label, isOffRange }: DateHeaderProps) {
	const today = new Date();

	const isToday =
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate();

	return (
		<span
			className={cn(
				"flex size-6 items-center justify-center rounded-full text-xs font-medium leading-none",
				isToday && "bg-primary font-semibold text-primary-foreground",
				!isToday && isOffRange && "text-muted-foreground/50",
			)}
		>
			{label}
		</span>
	);
}

function MonthEvent({ event }: EventProps<CalendarEvent>) {
	return <TaskPill deadline={event} />;
}

function ShowMore({ count }: ShowMoreProps<CalendarEvent>) {
	return <>+{count} more</>;
}

const CALENDAR_COMPONENTS = {
	month: {
		header: MonthHeader,
		dateHeader: MonthDateHeader,
		event: MonthEvent,
	},
	showMore: ShowMore,
};

const CALENDAR_VIEWS = {
	month: true,
	week: DeadlineWeekView,
	day: true,
};

type CalendarViewProps = {
	events: CalendarEvent[];
	onSelectEvent: (event: CalendarEvent) => void;
};

export function CalendarView({ events, onSelectEvent }: CalendarViewProps) {
	const date = useCalendarUIStore((state) => state.date);
	const view = useCalendarUIStore((state) => state.view);
	const setDate = useCalendarUIStore((state) => state.setDate);
	const setView = useCalendarUIStore((state) => state.setView);
	const setAnchorDate = useCalendarUIStore((state) => state.setAnchorDate);

	return (
		<div className="fora-calendar flex min-h-130 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
			<Calendar<CalendarEvent>
				localizer={localizer}
				events={events}
				date={date}
				view={view}
				views={CALENDAR_VIEWS}
				components={CALENDAR_COMPONENTS}
				toolbar={false}
				popup
				selectable="ignoreEvents"
				startAccessor="start"
				endAccessor="end"
				onNavigate={(newDate) => setDate(newDate)}
				onView={(nextView) => setView(nextView as CalendarViewMode)}
				onSelectSlot={(slot) => setAnchorDate(slot.start)}
				onSelectEvent={(event) => onSelectEvent(event)}
				style={{ height: "100%" }}
			/>
		</div>
	);
}
