import type {
	NotificationItem,
	NotificationItemOf,
} from "@/features/notifications/types";
import type { NotificationType } from "@/lib/db/types";
import { memberDisplayName } from "@/lib/user-display";

const ROLE_LABELS = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
} as const;

function actorName(notification: NotificationItem) {
	return notification.actor ? memberDisplayName(notification.actor) : "Someone";
}

const MESSAGES: {
	[K in NotificationType]: (notification: NotificationItemOf<K>) => string;
} = {
	workspace_invitation_received: (notification) =>
		`${actorName(notification)} invited you to join as ${
			ROLE_LABELS[notification.metadata?.role ?? "member"]
		}`,

	workspace_role_changed: (notification) =>
		`Your workspace role was changed to ${
			ROLE_LABELS[notification.metadata?.role ?? "member"]
		}`,

	workspace_member_removed: (notification) =>
		`You were removed from ${notification.metadata?.workspaceName ?? "this workspace"}`,

	workspace_ownership_transferred: (notification) =>
		`${actorName(notification)} made you the owner of ${
			notification.metadata?.workspaceName ?? "this workspace"
		}`,

	workspace_member_joined: (notification) =>
		`${notification.metadata?.memberName ?? "A new member"} accepted your invitation`,

	project_member_added: (notification) =>
		`${actorName(notification)} added you to ${notification.metadata?.projectName ?? "a project"}`,

	project_member_removed: (notification) =>
		`You were removed from ${notification.metadata?.projectName ?? "a project"}`,

	project_lead_assigned: (notification) =>
		`You are now the lead of ${notification.metadata?.projectName ?? "a project"}`,

	project_lead_removed: (notification) =>
		`You are no longer the lead of ${notification.metadata?.projectName ?? "a project"}`,

	task_assigned: (notification) =>
		`${actorName(notification)} assigned you "${notification.metadata?.taskTitle ?? "a task"}"`,

	task_unassigned: (notification) =>
		`${actorName(notification)} unassigned you from "${notification.metadata?.taskTitle ?? "a task"}"`,

	task_due_date_changed: (notification) =>
		notification.metadata?.dueDate
			? `The due date for "${notification.metadata.taskTitle}" changed`
			: `The due date for "${notification.metadata?.taskTitle ?? "a task"}" was removed`,

	task_comment_added: (notification) =>
		`${actorName(notification)} commented on "${notification.metadata?.taskTitle ?? "a task"}"`,

	task_completed: (notification) =>
		`${actorName(notification)} completed "${notification.metadata?.taskTitle ?? "a task"}"`,
};

export function notificationMessage(notification: NotificationItem) {
	const render = MESSAGES[notification.type] as (
		value: NotificationItem,
	) => string;

	return render(notification);
}
