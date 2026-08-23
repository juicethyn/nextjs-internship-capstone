import type { TaskPriority } from "@/lib/db/types";

export type TaskFieldChange =
	| { field: "title"; from: string; to: string }
	| { field: "priority"; from: TaskPriority; to: TaskPriority }
	| { field: "dueDate"; from: string | null; to: string | null }
	| { field: "startDate"; from: string | null; to: string | null }
	| { field: "description" };

type DiffableTask = {
	title: string;
	priority: TaskPriority;
	startDate: Date | null;
	dueDate: Date | null;
	description: unknown;
};

function toIsoOrNull(value: Date | null) {
	return value ? value.toISOString() : null;
}

function sameDate(previous: Date | null, next: Date | null) {
	if (!previous && !next) return true;
	if (!previous || !next) return false;

	return previous.getTime() === next.getTime();
}

export function diffTaskFields(
	previous: DiffableTask,
	next: DiffableTask,
): TaskFieldChange[] {
	const changes: TaskFieldChange[] = [];

	if (previous.title !== next.title) {
		changes.push({ field: "title", from: previous.title, to: next.title });
	}

	if (previous.priority !== next.priority) {
		changes.push({
			field: "priority",
			from: previous.priority,
			to: next.priority,
		});
	}

	if (!sameDate(previous.dueDate, next.dueDate)) {
		changes.push({
			field: "dueDate",
			from: toIsoOrNull(previous.dueDate),
			to: toIsoOrNull(next.dueDate),
		});
	}

	if (!sameDate(previous.startDate, next.startDate)) {
		changes.push({
			field: "startDate",
			from: toIsoOrNull(previous.startDate),
			to: toIsoOrNull(next.startDate),
		});
	}

	if (
		JSON.stringify(previous.description) !== JSON.stringify(next.description)
	) {
		changes.push({ field: "description" });
	}

	return changes;
}
