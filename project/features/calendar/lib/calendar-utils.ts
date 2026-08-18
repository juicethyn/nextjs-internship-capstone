import type {
	CalendarDeadline,
	CalendarEvent,
	CalendarGroup,
	CalendarItem,
	PriorityFilter,
} from "@/features/calendar/types";
import type { TaskPriority } from "@/lib/db/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const UPCOMING_WINDOW_DAYS = 14;

export const FOOTER_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

function dayIndex(date: Date) {
	return Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
	);
}

function todayDayIndex() {
	return dayIndex(new Date());
}

export function toCalendarDay(stamp: Date) {
	return new Date(stamp.getFullYear(), stamp.getMonth(), stamp.getDate());
}

export function formatCalendarDay(stamp: Date) {
	return stamp.toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
}

export function toTaskItem(deadline: CalendarDeadline): CalendarItem {
	const day = toCalendarDay(deadline.dueDate);

	return {
		kind: "task",
		id: deadline.id,
		title: deadline.title,
		start: day,
		end: day,
		allDay: true,
		deadline,
	};
}

export function toEventItem(event: CalendarEvent): CalendarItem {
	return {
		kind: "event",
		id: event.id,
		title: event.title,
		start: event.startAt,
		end: event.endAt,
		allDay: event.allDay,
		event,
	};
}

export function formatEventRange(event: CalendarEvent) {
	const dayOptions: Intl.DateTimeFormatOptions = {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	};

	const startDay = event.startAt.toLocaleDateString("en-US", dayOptions);
	const endDay = event.endAt.toLocaleDateString("en-US", dayOptions);

	const sameDay = startDay === endDay;

	if (event.allDay) {
		return sameDay ? `${startDay} · All day` : `${startDay} → ${endDay}`;
	}

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	};

	const startTime = event.startAt.toLocaleTimeString("en-US", timeOptions);
	const endTime = event.endAt.toLocaleTimeString("en-US", timeOptions);

	return sameDay
		? `${startDay} · ${startTime} – ${endTime}`
		: `${startDay} ${startTime} → ${endDay} ${endTime}`;
}

export function formatEventTime(event: CalendarEvent) {
	if (event.allDay) return "";

	return event.startAt
		.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.replace(/\s/g, "")
		.toLowerCase();
}

export function isCompleted(deadline: CalendarDeadline) {
	return deadline.completedAt !== null;
}

export function filterDeadlines(
	deadlines: CalendarDeadline[],
	priority: PriorityFilter,
	projectId: string,
) {
	return deadlines.filter((deadline) => {
		if (priority !== "all" && deadline.priority !== priority) return false;

		if (projectId !== "all" && deadline.projectId !== projectId) return false;

		return true;
	});
}

export function getUpcomingItems(items: CalendarItem[], anchor?: Date | null) {
	const start = anchor ? dayIndex(anchor) : todayDayIndex();

	return items
		.filter((item) => {
			if (item.kind === "task" && isCompleted(item.deadline)) return false;

			const offset = dayIndex(item.start) - start;

			return offset >= 0 && offset <= UPCOMING_WINDOW_DAYS;
		})
		.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function taskDeadlines(items: CalendarItem[]) {
	return items
		.filter((item) => item.kind === "task")
		.map((item) => item.deadline);
}

export function countEvents(items: CalendarItem[]) {
	return items.filter((item) => item.kind === "event").length;
}

export function groupItemsByDay(items: CalendarItem[]): CalendarGroup[] {
	const today = todayDayIndex();

	const groups = new Map<number, CalendarGroup>();

	for (const item of items) {
		const index = dayIndex(item.start);

		const existing = groups.get(index);

		if (existing) {
			existing.items.push(item);
			continue;
		}

		const offset = index - today;

		const label =
			offset === 0
				? "Today"
				: offset === 1
					? "Tomorrow"
					: formatCalendarDay(item.start);

		groups.set(index, { label, items: [item] });
	}

	return [...groups.entries()]
		.sort(([a], [b]) => a - b)
		.map(([, group]) => group);
}

export function countByPriority(deadlines: CalendarDeadline[]) {
	return FOOTER_PRIORITIES.map((priority) => ({
		priority,
		total: deadlines.filter((deadline) => deadline.priority === priority)
			.length,
	}));
}

export function addDays(date: Date, amount: number) {
	const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	next.setDate(next.getDate() + amount);

	return next;
}

export function startOfWeekLocal(date: Date) {
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	start.setDate(start.getDate() - start.getDay());

	return start;
}

export function getWeekRange(date: Date) {
	const start = startOfWeekLocal(date);

	return Array.from({ length: 7 }, (_, index) => {
		const day = new Date(start);

		day.setDate(start.getDate() + index);

		return day;
	});
}

export function isSameLocalDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}
