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
] as const;

export type ActivityAction = (typeof activityActionEnum)[number];

export const entityTypeEnum = [
	"workspace",
	"project",
	"list",
	"task",
	"comment",
	"label",
] as const;

export type EntityType = (typeof entityTypeEnum)[number];
