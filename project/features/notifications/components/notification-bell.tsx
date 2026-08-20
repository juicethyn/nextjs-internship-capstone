"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationCard } from "@/features/notifications/components/notification-card";
import {
	useNotifications,
	useUnreadNotificationCount,
} from "@/features/notifications/hooks/use-notifications";

const TICK_MS = 30_000;

export function NotificationBell() {
	const [isOpen, setOpen] = useState(false);

	const { unreadCount } = useUnreadNotificationCount();
	const { notifications, isLoading, markRead, markAllRead, isMarkingAllRead } =
		useNotifications(isOpen);

	const [, forceTick] = useState(0);

	useEffect(() => {
		if (!isOpen) return;

		const id = setInterval(() => forceTick((tick) => tick + 1), TICK_MS);

		return () => clearInterval(id);
	}, [isOpen]);

	return (
		<Popover open={isOpen} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="size-5" />

					{unreadCount > 0 && (
						<span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
					)}

					<span className="sr-only">
						{unreadCount > 0
							? `Notifications, ${unreadCount} unread`
							: "Notifications"}
					</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-96 gap-0 overflow-hidden p-0">
				<div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
					<p className="text-sm font-semibold">Notifications</p>

					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => markAllRead()}
							disabled={isMarkingAllRead}
							className="h-auto px-2 py-1 text-xs"
						>
							Mark all as read
						</Button>
					)}
				</div>

				{isLoading ? (
					<div className="space-y-3 p-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : notifications.length === 0 ? (
					<div className="px-4 py-10 text-center">
						<p className="text-sm text-muted-foreground">
							You're all caught up.
						</p>
					</div>
				) : (
					<div className="board-scrollbar max-h-96 overflow-y-auto overscroll-contain">
						<div className="divide-y">
							{notifications.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onRead={markRead}
									onNavigate={() => setOpen(false)}
								/>
							))}
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
