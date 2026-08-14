import type { ActivityAction, EntityType } from "@/lib/db/types";

const PHRASES: Partial<
	Record<EntityType, Partial<Record<ActivityAction, string>>>
> = {
	task: {
		created: "created a task",
		updated: "updated a task",
		deleted: "deleted a task",
		completed: "completed a task",
		moved: "moved a task",
		assigned: "assigned a task",
		unassigned: "unassigned a task",
	},
	list: {
		created: "created a list",
		updated: "renamed a list",
		deleted: "deleted a list",
	},
	comment: {
		created: "commented on",
		deleted: "deleted a comment on",
	},
	project: {
		created: "created the project",
		updated: "updated the project",
		archived: "archived the project",
		restored: "restored the project",
		deleted: "deleted the project",
		transferred: "transferred project lead",
	},
	project_member: {
		created: "added a member",
		deleted: "removed a member",
	},
	task_label: {
		created: "created a label",
		deleted: "deleted a label",
	},
};

const TITLE_KEYS = ["title", "taskTitle", "name"] as const;

export function activityPhrase(action: ActivityAction, entity: EntityType) {
	return PHRASES[entity]?.[action] ?? `${action} ${entity.replace(/_/g, " ")}`;
}

export function activityTitle(metadata: unknown) {
	if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
		return null;
	}

	const record = metadata as Record<string, unknown>;

	for (const key of TITLE_KEYS) {
		const value = record[key];

		if (typeof value === "string" && value.trim().length > 0) {
			return value;
		}
	}

	return null;
}
