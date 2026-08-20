"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	NOTIFICATIONS_KEY,
	UNREAD_COUNT_KEY,
} from "@/features/notifications/hooks/use-notifications";
import type { NotificationItem } from "@/features/notifications/types";
import { NOTIFICATION_CREATED_EVENT, userChannel } from "@/lib/pusher/channels";
import { getPusherClient } from "@/lib/pusher/client";

type NotificationListenerProps = {
	userId: string;
};

export function NotificationListener({ userId }: NotificationListenerProps) {
	const queryClient = useQueryClient();

	useEffect(() => {
		const channelName = userChannel(userId);
		const channel = getPusherClient().subscribe(channelName);

		const handleCreated = (notification: NotificationItem) => {
			queryClient.setQueryData<NotificationItem[]>(
				NOTIFICATIONS_KEY,
				(current) => {
					if (!current) return current;
					if (current.some((item) => item.id === notification.id)) {
						return current;
					}

					return [notification, ...current];
				},
			);

			queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
		};

		channel.bind(NOTIFICATION_CREATED_EVENT, handleCreated);

		return () => {
			channel.unbind(NOTIFICATION_CREATED_EVENT, handleCreated);
			getPusherClient().unsubscribe(channelName);
		};
	}, [userId, queryClient]);

	return null;
}
