import { and, count, eq, inArray, isNull } from "drizzle-orm";
import type { DbClient } from "@/lib/db/types";
import type { AnyCreateNotificationInput } from "@/lib/validations/notification";
import { db } from "../index";
import { notifications } from "../schema";

export function getNotificationsByRecipient(recipientId: string, limit = 20) {
	return db.query.notifications.findMany({
		where: eq(notifications.recipientId, recipientId),
		orderBy: (notification, { desc }) => desc(notification.createdAt),
		limit,
		with: {
			workspace: { columns: { id: true, name: true, slug: true, color: true } },
			project: { columns: { id: true, name: true, slug: true } },
			actor: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					imageUrl: true,
				},
			},
		},
	});
}

export function getNotificationsByIds(ids: string[]) {
	if (ids.length === 0) return [];

	return db.query.notifications.findMany({
		where: inArray(notifications.id, ids),
		orderBy: (notification, { desc }) => desc(notification.createdAt),
		with: {
			workspace: { columns: { id: true, name: true, slug: true, color: true } },
			project: { columns: { id: true, name: true, slug: true } },
			actor: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					imageUrl: true,
				},
			},
		},
	});
}

export async function getUnreadNotificationCount(recipientId: string) {
	const [row] = await db
		.select({ total: count() })
		.from(notifications)
		.where(
			and(
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		);

	return row?.total ?? 0;
}

export async function createNotifications(
	data: AnyCreateNotificationInput[],
	dbClient: DbClient = db,
) {
	if (data.length === 0) return [];

	return dbClient.insert(notifications).values(data).returning();
}

export async function markNotificationRead(
	notificationId: string,
	recipientId: string,
) {
	const [notification] = await db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.id, notificationId),
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		)
		.returning();

	return notification;
}

export async function markAllNotificationsRead(recipientId: string) {
	return db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		)
		.returning({ id: notifications.id });
}

export async function deleteWorkspaceNotificationsForUser(
	workspaceId: string,
	recipientId: string,
	dbClient: DbClient = db,
) {
	return dbClient
		.delete(notifications)
		.where(
			and(
				eq(notifications.workspaceId, workspaceId),
				eq(notifications.recipientId, recipientId),
			),
		)
		.returning({ id: notifications.id });
}
