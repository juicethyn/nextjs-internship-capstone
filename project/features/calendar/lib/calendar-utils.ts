import type {
	CalendarDeadline,
	CalendarEvent,
	DeadlineGroup,
	PriorityFilter,
} from "@/features/calendar/types";
import type { TaskPriority } from "@/lib/db/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const UPCOMING_WINDOW_DAYS = 14;

export const FOOTER_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

function utcDayIndex(date: Date) {
	return Math.floor(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
			DAY_MS,
	);
}

function todayDayIndex() {
	return utcDayIndex(new Date());
}

export function toCalendarDay(dueDate: Date) {
	return new Date(
		dueDate.getUTCFullYear(),
		dueDate.getUTCMonth(),
		dueDate.getUTCDate(),
	);
}

export function toCalendarEvent(deadline: CalendarDeadline): CalendarEvent {
	const day = toCalendarDay(deadline.dueDate);

	return {
		...deadline,
		start: day,
		end: day,
		allDay: true,
	};
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

function localDayIndex(date: Date) {
	return Math.floor(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
	);
}

export function getUpcomingDeadlines(
	deadlines: CalendarDeadline[],
	anchor?: Date | null,
) {
	const start = anchor ? localDayIndex(anchor) : todayDayIndex();

	return deadlines
		.filter((deadline) => {
			if (isCompleted(deadline)) return false;

			const offset = utcDayIndex(deadline.dueDate) - start;

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
		const index = utcDayIndex(deadline.dueDate);

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
					: deadline.dueDate.toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							timeZone: "UTC",
						});

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
