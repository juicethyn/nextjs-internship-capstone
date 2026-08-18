import type { EventType, TaskPriority } from "@/lib/db/types";

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

export type CalendarEvent = {
	id: string;
	title: string;
	description: string | null;
	startAt: Date;
	endAt: Date;
	allDay: boolean;
	eventType: EventType;
	projectId: string;
	projectName: string;
	projectSlug: string;
	projectColor: string;
};

export type CalendarItem =
	| {
			kind: "task";
			id: string;
			title: string;
			start: Date;
			end: Date;
			allDay: true;
			deadline: CalendarDeadline;
	  }
	| {
			kind: "event";
			id: string;
			title: string;
			start: Date;
			end: Date;
			allDay: boolean;
			event: CalendarEvent;
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
