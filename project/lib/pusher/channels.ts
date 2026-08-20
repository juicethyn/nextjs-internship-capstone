export const NOTIFICATION_CREATED_EVENT = "notification:created";

export const BOARD_CHANGED_EVENT = "board:changed";

const PROJECT_CHANNEL_PREFIX = "presence-project-";

export type BoardEventKind =
	| "list_created"
	| "list_updated"
	| "list_deleted"
	| "list_moved"
	| "task_created"
	| "task_updated"
	| "task_deleted"
	| "task_moved"
	| "comment_created"
	| "comment_deleted"
	| "label_created"
	| "label_deleted"
	| "task_label_added"
	| "task_label_removed";

export type BoardChangedPayload = {
	actorId: string;
	kind: BoardEventKind;
};

export function userChannel(userId: string) {
	return `private-user-${userId}`;
}

export function projectChannel(projectId: string) {
	return `${PROJECT_CHANNEL_PREFIX}${projectId}`;
}

export function projectIdFromChannel(channelName: string) {
	if (!channelName.startsWith(PROJECT_CHANNEL_PREFIX)) return null;

	const projectId = channelName.slice(PROJECT_CHANNEL_PREFIX.length);

	return projectId.length > 0 ? projectId : null;
}
