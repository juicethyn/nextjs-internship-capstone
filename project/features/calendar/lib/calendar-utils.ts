import type {
	CalendarDeadline,
	CalendarEvent,
	CalendarItem,
	DeadlineGroup,
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

export function combineDateAndTime(date: Date, time: string) {
	const [hours, minutes] = time.split(":").map(Number);

	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		Number.isFinite(hours) ? hours : 0,
		Number.isFinite(minutes) ? minutes : 0,
	);
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

export function getUpcomingDeadlines(
	deadlines: CalendarDeadline[],
	anchor?: Date | null,
) {
	const start = anchor ? dayIndex(anchor) : todayDayIndex();

	return deadlines
		.filter((deadline) => {
			if (isCompleted(deadline)) return false;

			const offset = dayIndex(deadline.dueDate) - start;

			return offset >= 0 && offset <= UPCOMING_WINDOW_DAYS;
		})
		.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function groupDeadlinesByDay(
	deadlines: CalendarDeadline[],
): DeadlineGroup[] {
	const today = todayDayIndex();

	const groups = new Map<number, DeadlineGroup>();

	for (const deadline of deadlines) {
		const index = dayIndex(deadline.dueDate);

		const existing = groups.get(index);

		if (existing) {
			existing.deadlines.push(deadline);
			continue;
		}

		const offset = index - today;

		const label =
			offset === 0
				? "Today"
				: offset === 1
					? "Tomorrow"
					: formatCalendarDay(deadline.dueDate);

		groups.set(index, { label, deadlines: [deadline] });
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
