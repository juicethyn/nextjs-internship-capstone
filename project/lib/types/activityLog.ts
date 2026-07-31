export const activityActionEnum = [
	"created",
	"updated",
	"deleted",
	"archived",
	"restored",
	"transferred",
	"assigned",
	"unassigned",
	"completed",
	"moved",
	"invited",
	"joined",
	"accepted",
] as const;

export type ActivityAction = (typeof activityActionEnum)[number];

export const entityTypeEnum = [
	"workspace",
	"workspace_member",
	"workspace_invitation",
	"project",
	"project_member",
	"list",
	"task",
	"comment",
	"label",
	"task_label",
] as const;

export type EntityType = (typeof entityTypeEnum)[number];
