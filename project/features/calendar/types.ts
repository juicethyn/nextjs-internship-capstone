import type { TaskPriority } from "@/lib/db/types";

export type CalendarDeadline = {
	id: string;
	title: string;
	priority: TaskPriority;
	dueDate: Date;
	completedAt: Date | null;
	projectId: string;
	projectName: string;
	projectSlug: string;
	projectColor: string;
};

export type CalendarEvent = CalendarDeadline & {
	start: Date;
	end: Date;
	allDay: true;
};

export type CalendarViewMode = "month" | "week";

export type PriorityFilter = "all" | "high" | "medium" | "low";

export type DeadlineGroup = {
	label: string;
	deadlines: CalendarDeadline[];
};

export type CalendarProject = {
	id: string;
	name: string;
	color: string;
};
