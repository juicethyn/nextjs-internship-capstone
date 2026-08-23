import { PRIORITY_LABELS } from "@/features/projects/kanban/components/priority-badge";
import type { TaskFieldChange } from "@/features/projects/kanban/lib/task-changes-diff";
import { formatProjectDate } from "@/lib/date-formatter";
import type { ActivityAction, TaskPriority } from "@/lib/db/types";

export type TaskActivityLine = {
	summary: string;
	detail: string | null;
};

function readString(metadata: Record<string, unknown>, key: string) {
	const value = metadata[key];

	return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readChanges(metadata: Record<string, unknown>): TaskFieldChange[] {
	const value = metadata.changes;

	return Array.isArray(value) ? (value as TaskFieldChange[]) : [];
}

function formatDateValue(value: string | null) {
	return value ? formatProjectDate(new Date(value)) : null;
}

function describeChange(change: TaskFieldChange): TaskActivityLine {
	switch (change.field) {
		case "title":
			return {
				summary: "renamed this task",
				detail: `${change.from} → ${change.to}`,
			};

		case "priority":
			return {
				summary: "changed the priority",
				detail: `${PRIORITY_LABELS[change.from as TaskPriority]} → ${
					PRIORITY_LABELS[change.to as TaskPriority]
				}`,
			};

		case "dueDate": {
			const to = formatDateValue(change.to);
			const from = formatDateValue(change.from);

			if (!to) return { summary: "removed the due date", detail: null };

			return {
				summary: from ? "changed the due date" : "set the due date",
				detail: from ? `${from} → ${to}` : to,
			};
		}

		case "startDate": {
			const to = formatDateValue(change.to);
			const from = formatDateValue(change.from);

			if (!to) return { summary: "removed the start date", detail: null };

			return {
				summary: from ? "changed the start date" : "set the start date",
				detail: from ? `${from} → ${to}` : to,
			};
		}

		default:
			return { summary: "updated the description", detail: null };
	}
}

export function taskActivityLines(
	action: ActivityAction,
	metadata: unknown,
): TaskActivityLine[] {
	const record =
		metadata && typeof metadata === "object" && !Array.isArray(metadata)
			? (metadata as Record<string, unknown>)
			: {};

	switch (action) {
		case "created":
			return [{ summary: "created this task", detail: null }];

		case "assigned":
			return [
				{
					summary: `assigned this to ${readString(record, "assigneeName") ?? "someone"}`,
					detail: null,
				},
			];

		case "unassigned":
			return [
				{
					summary: `unassigned ${readString(record, "assigneeName") ?? "someone"}`,
					detail: null,
				},
			];

		case "moved": {
			const from = readString(record, "fromList");
			const to = readString(record, "toList");

			return [
				{
					summary: "moved this task",
					detail: from && to ? `${from} → ${to}` : null,
				},
			];
		}

		case "completed":
			return [{ summary: "completed this task", detail: null }];

		case "updated": {
			const changes = readChanges(record);

			if (changes.length === 0) {
				return [{ summary: "updated this task", detail: null }];
			}

			return changes.map(describeChange);
		}

		default:
			return [{ summary: `${action} this task`, detail: null }];
	}
}
