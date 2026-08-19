import type { TaskPriority } from "@/lib/db/types";

export type TaskSortKey =
	| "manual"
	| "title"
	| "priority"
	| "dueDate"
	| "createdAt";

export const TASK_SORT_OPTIONS = [
	{ value: "manual", label: "Default" },
	{ value: "title", label: "Title (A → Z)" },
	{ value: "priority", label: "Priority (High → Low)" },
	{ value: "dueDate", label: "Due date (Earliest)" },
	{ value: "createdAt", label: "Created (Newest)" },
] as const satisfies readonly { value: TaskSortKey; label: string }[];

export const DEFAULT_TASK_SORT: TaskSortKey = "manual";

export const PRIORITY_RANK: Record<TaskPriority, number> = {
	high: 3,
	medium: 2,
	low: 1,
	none: 0,
};

type SortableTask = {
	title: string;
	priority: TaskPriority;
	position: number;
	dueDate: Date | null;
	createdAt: Date;
};

function compareTitle(a: SortableTask, b: SortableTask) {
	return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

export function sortTasks<T extends SortableTask>(
	tasks: T[],
	key: TaskSortKey,
): T[] {
	const sorted = [...tasks];

	if (key === "manual") {
		return sorted.sort((a, b) => a.position - b.position);
	}

	return sorted.sort((a, b) => {
		if (key === "priority") {
			const byPriority = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];

			if (byPriority !== 0) return byPriority;
		}

		if (key === "dueDate") {
			const aDue = a.dueDate?.getTime() ?? null;
			const bDue = b.dueDate?.getTime() ?? null;

			if (aDue !== bDue) {
				if (aDue === null) return 1;
				if (bDue === null) return -1;

				return aDue - bDue;
			}
		}

		if (key === "createdAt") {
			const byCreated = b.createdAt.getTime() - a.createdAt.getTime();

			if (byCreated !== 0) return byCreated;
		}

		return compareTitle(a, b) || a.position - b.position;
	});
}
