import type { db } from "@/lib/db";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbClient = typeof db | Transaction;

export const workspaceMemberRoles = ["owner", "admin", "member"] as const;
export type WorkspaceMemberRole = (typeof workspaceMemberRoles)[number];

export const invitationStatus = [
	"pending",
	"accepted",
	"declined",
	"revoked",
	"expired",
] as const;

export type InvitationStatus = (typeof invitationStatus)[number];

export const listTypes = ["todo", "in_progress", "done"] as const;
export type ListType = (typeof listTypes)[number];

export const creatableListTypes = ["todo", "in_progress"] as const;
export type CreatableListType = (typeof creatableListTypes)[number];

export const taskPriorities = ["none", "low", "medium", "high"] as const;
export type TaskPriority = (typeof taskPriorities)[number];

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
