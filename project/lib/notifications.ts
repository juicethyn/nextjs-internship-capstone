import { isNotificationAllowed } from "@/features/notifications/lib/preferences";
import { db } from "./db";
import {
	createNotifications,
	getNotificationsByIds,
} from "./db/queries/notifications";
import { getNotificationPreferences } from "./db/queries/users";
import type { DbClient } from "./db/types";
import { NOTIFICATION_CREATED_EVENT, userChannel } from "./pusher/channels";
import { pusherServer } from "./pusher/server";
import type { AnyCreateNotificationInput } from "./validations/notification";

export type NotificationRecord = Awaited<
	ReturnType<typeof getNotificationsByIds>
>[number];

async function publishNotifications(records: NotificationRecord[]) {
	await Promise.all(
		records.map(async (record) => {
			try {
				await pusherServer.trigger(
					userChannel(record.recipientId),
					NOTIFICATION_CREATED_EVENT,
					record,
				);
			} catch (error) {
				console.warn("Failed to publish notification:", error);
			}
		}),
	);
}

export async function dispatchNotifications(
	inputs: AnyCreateNotificationInput[],
	dbClient: DbClient = db,
) {
	const targeted = inputs.filter(
		(input) => input.recipientId !== input.actorId,
	);

	if (targeted.length === 0) return [];

	const preferences = await getNotificationPreferences([
		...new Set(targeted.map((input) => input.recipientId)),
	]);

	const allowed = targeted.filter((input) =>
		isNotificationAllowed(preferences.get(input.recipientId), input.type),
	);

	if (allowed.length === 0) return [];

	const inserted = await createNotifications(allowed, dbClient);
	const records = await getNotificationsByIds(inserted.map((row) => row.id));

	await publishNotifications(records);

	return records;
}
