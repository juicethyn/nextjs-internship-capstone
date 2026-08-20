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

export const eventTypes = [
	"meeting",
	"planning",
	"review",
	"presentation",
	"discussion",
	"other",
] as const;

export type EventType = (typeof eventTypes)[number];

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

export const notificationTypes = [
	"workspace_invitation_received",
	"workspace_role_changed",
	"workspace_member_removed",
	"workspace_ownership_transferred",
	"workspace_member_joined",
	"project_member_added",
	"project_member_removed",
	"project_lead_assigned",
	"project_lead_removed",
	"task_assigned",
	"task_unassigned",
	"task_due_date_changed",
	"task_comment_added",
	"task_completed",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notificationCategories = ["workspace", "project", "task"] as const;

export type NotificationCategory = (typeof notificationCategories)[number];
