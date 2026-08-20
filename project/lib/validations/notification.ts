import type { NotificationType, WorkspaceMemberRole } from "@/lib/db/types";

export interface NotificationPayloads
	extends Record<NotificationType, Record<string, unknown>> {
	workspace_invitation_received: { role: WorkspaceMemberRole };
	workspace_role_changed: {
		role: WorkspaceMemberRole;
		previousRole: WorkspaceMemberRole;
	};
	workspace_member_removed: { workspaceName: string };
	workspace_ownership_transferred: { workspaceName: string };
	workspace_member_joined: { memberName: string };
	project_member_added: { projectName: string };
	project_member_removed: { projectName: string };
	project_lead_assigned: { projectName: string };
	project_lead_removed: { projectName: string };
	task_assigned: { taskTitle: string; projectName: string };
	task_unassigned: { taskTitle: string; projectName: string };
	task_due_date_changed: {
		taskTitle: string;
		projectName: string;
		dueDate: string | null;
		previousDueDate: string | null;
	};
	task_comment_added: { taskTitle: string; projectName: string };
	task_completed: { taskTitle: string; projectName: string };
}

export type NotificationMetadata = NotificationPayloads[NotificationType];

export type CreateNotificationInput<
	T extends NotificationType = NotificationType,
> = {
	type: T;
	recipientId: string;
	workspaceId: string;
	actorId?: string | null;
	projectId?: string | null;
	entityId?: string | null;
	metadata: NotificationPayloads[T];
};

export type AnyCreateNotificationInput = {
	[K in NotificationType]: CreateNotificationInput<K>;
}[NotificationType];
