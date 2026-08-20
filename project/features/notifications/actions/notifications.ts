"use server";

import { getCurrentUser } from "@/lib/auth";
import {
	getNotificationsByRecipient,
	getUnreadNotificationCount,
	markAllNotificationsRead,
	markNotificationRead,
} from "@/lib/db/queries/notifications";

export async function getNotificationsAction() {
	const user = await getCurrentUser();

	const notifications = await getNotificationsByRecipient(user.id);

	return { success: true as const, data: notifications };
}

export async function getUnreadNotificationCountAction() {
	const user = await getCurrentUser();

	const total = await getUnreadNotificationCount(user.id);

	return { success: true as const, data: total };
}

export async function markNotificationReadAction(notificationId: string) {
	const user = await getCurrentUser();

	await markNotificationRead(notificationId, user.id);

	return { success: true as const };
}

export async function markAllNotificationsReadAction() {
	const user = await getCurrentUser();

	await markAllNotificationsRead(user.id);

	return { success: true as const };
}
