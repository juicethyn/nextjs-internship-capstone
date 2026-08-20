import type { getNotificationsAction } from "@/features/notifications/actions/notifications";
import type { NotificationType } from "@/lib/db/types";
import type { NotificationPayloads } from "@/lib/validations/notification";

export type NotificationItem = Awaited<
	ReturnType<typeof getNotificationsAction>
>["data"][number];

export type NotificationItemOf<T extends NotificationType> = Omit<
	NotificationItem,
	"type" | "metadata"
> & {
	type: T;
	metadata: NotificationPayloads[T] | null;
};
