"use client";

import { useRouter } from "next/navigation";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { notificationMessage } from "@/features/notifications/lib/copy";
import { notificationHref } from "@/features/notifications/lib/href";
import type { NotificationItem } from "@/features/notifications/types";
import { formatCommentTimestamp } from "@/lib/date-formatter";

type NotificationCardProps = {
	notification: NotificationItem;
	onRead: (notificationId: string) => void;
	onNavigate: () => void;
};

export function NotificationCard({
	notification,
	onRead,
	onNavigate,
}: NotificationCardProps) {
	const router = useRouter();

	const isUnread = !notification.readAt;
	const href = notificationHref(notification);

	const handleClick = () => {
		if (isUnread) {
			onRead(notification.id);
		}

		if (href) {
			onNavigate();
			router.push(href);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted"
		>
			<div className="flex w-full items-center gap-2">
				<WorkspaceAvatar
					name={notification.workspace.name}
					color={notification.workspace.color}
					size="xs"
				/>

				<span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
					{notification.workspace.name}
				</span>

				{isUnread && (
					<span className="size-2 shrink-0 rounded-full bg-primary" />
				)}
			</div>

			<p className="text-sm">{notificationMessage(notification)}</p>

			<p className="text-xs text-muted-foreground">
				{formatCommentTimestamp(notification.createdAt)}
			</p>
		</button>
	);
}
