"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getNotificationsAction,
	getUnreadNotificationCountAction,
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "@/features/notifications/actions/notifications";
import type { NotificationItem } from "@/features/notifications/types";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

export function useNotifications(enabled = true) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: NOTIFICATIONS_KEY,
		queryFn: async () => {
			const result = await getNotificationsAction();
			return result.data;
		},
		enabled,
	});

	const markRead = useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationReadAction(notificationId),
		onMutate: async (notificationId) => {
			await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

			const previous =
				queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_KEY);

			queryClient.setQueryData<NotificationItem[]>(
				NOTIFICATIONS_KEY,
				(current) =>
					current?.map((item) =>
						item.id === notificationId && !item.readAt
							? { ...item, readAt: new Date() }
							: item,
					),
			);

			return { previous };
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
		},
	});

	const markAllRead = useMutation({
		mutationFn: () => markAllNotificationsReadAction(),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

			const previous =
				queryClient.getQueryData<NotificationItem[]>(NOTIFICATIONS_KEY);

			queryClient.setQueryData<NotificationItem[]>(
				NOTIFICATIONS_KEY,
				(current) =>
					current?.map((item) =>
						item.readAt ? item : { ...item, readAt: new Date() },
					),
			);

			return { previous };
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
		},
	});

	return {
		notifications: query.data ?? [],
		isLoading: query.isLoading,
		markRead: markRead.mutate,
		markAllRead: markAllRead.mutate,
		isMarkingAllRead: markAllRead.isPending,
	};
}

export function useUnreadNotificationCount() {
	const query = useQuery({
		queryKey: UNREAD_COUNT_KEY,
		queryFn: async () => {
			const result = await getUnreadNotificationCountAction();
			return result.data;
		},
	});

	return { unreadCount: query.data ?? 0 };
}
