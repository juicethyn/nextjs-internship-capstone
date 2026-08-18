"use client";

import { format } from "date-fns";
import type { NavigateAction } from "react-big-calendar";
import {
	addDays,
	getWeekRange,
	startOfWeekLocal,
} from "@/features/calendar/lib/calendar-utils";
import { useCalendarUIStore } from "@/features/calendar/store";
import type { CalendarItem } from "@/features/calendar/types";
import { DeadlineColumns } from "./deadline-columns";

type DeadlineWeekViewProps = {
	date: Date;
	events: CalendarItem[];
	onSelectEvent?: (event: CalendarItem) => void;
};

export function DeadlineWeekView({
	date,
	events,
	onSelectEvent,
}: DeadlineWeekViewProps) {
	const anchorDate = useCalendarUIStore((state) => state.anchorDate);
	const setAnchorDate = useCalendarUIStore((state) => state.setAnchorDate);

	return (
		<DeadlineColumns
			days={getWeekRange(date)}
			events={events}
			anchorDate={anchorDate}
			onSelectEvent={onSelectEvent}
			onSelectDay={setAnchorDate}
		/>
	);
}

DeadlineWeekView.range = (date: Date) => getWeekRange(date);

DeadlineWeekView.navigate = (date: Date, action: NavigateAction) => {
	const start = startOfWeekLocal(date);

	if (action === "PREV") return addDays(start, -7);

	if (action === "NEXT") return addDays(start, 7);

	return start;
};

DeadlineWeekView.title = (date: Date) => {
	const days = getWeekRange(date);

	const start = days[0];

	const end = days[6];

	const endFormat =
		start.getMonth() === end.getMonth() ? "d, yyyy" : "MMM d, yyyy";

	return `${format(start, "MMM d")} – ${format(end, endFormat)}`;
};
