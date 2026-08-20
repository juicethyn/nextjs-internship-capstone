import type { NotificationCategory, NotificationType } from "@/lib/db/types";

export const NOTIFICATION_CATEGORY: Record<
	NotificationType,
	NotificationCategory
> = {
	workspace_invitation_received: "workspace",
	workspace_role_changed: "workspace",
	workspace_member_removed: "workspace",
	workspace_ownership_transferred: "workspace",
	workspace_member_joined: "workspace",
	project_member_added: "project",
	project_member_removed: "project",
	project_lead_assigned: "project",
	project_lead_removed: "project",
	task_assigned: "task",
	task_unassigned: "task",
	task_due_date_changed: "task",
	task_comment_added: "task",
	task_completed: "task",
};

export type NotificationPreferences = {
	notificationsMuted: boolean;
	mutedNotificationCategories: NotificationCategory[];
};

export function isNotificationAllowed(
	preferences: NotificationPreferences | undefined,
	type: NotificationType,
) {
	if (!preferences) return true;

	if (preferences.notificationsMuted) return false;

	return !preferences.mutedNotificationCategories.includes(
		NOTIFICATION_CATEGORY[type],
	);
}
