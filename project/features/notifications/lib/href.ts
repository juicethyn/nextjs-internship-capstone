import type { NotificationItem } from "@/features/notifications/types";

export function notificationHref(notification: NotificationItem) {
	const workspaceSlug = notification.workspace.slug;
	const projectSlug = notification.project?.slug;

	switch (notification.type) {
		case "workspace_member_removed":
		case "project_member_removed":
			return null;

		case "workspace_invitation_received":
		case "workspace_role_changed":
		case "workspace_ownership_transferred":
		case "workspace_member_joined":
			return `/w/${workspaceSlug}/dashboard`;

		case "project_member_added":
		case "project_lead_assigned":
		case "project_lead_removed":
			return projectSlug
				? `/w/${workspaceSlug}/projects/${projectSlug}`
				: `/w/${workspaceSlug}/projects`;

		default:
			if (!projectSlug) return `/w/${workspaceSlug}/dashboard`;

			return notification.entityId
				? `/w/${workspaceSlug}/projects/${projectSlug}?task=${notification.entityId}`
				: `/w/${workspaceSlug}/projects/${projectSlug}`;
	}
}
