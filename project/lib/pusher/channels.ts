export const NOTIFICATION_CREATED_EVENT = "notification:created";

export function userChannel(userId: string) {
	return `private-user-${userId}`;
}
