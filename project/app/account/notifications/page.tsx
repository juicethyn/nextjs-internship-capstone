import { AccountHeader } from "@/features/account/components/account-header";
import { NotificationPreferences } from "@/features/account/components/notification-preferences";
import { getCurrentUser } from "@/lib/auth";

export default async function NotificationsPage() {
	const user = await getCurrentUser();

	return (
		<div className="space-y-6">
			<AccountHeader
				title="Notifications"
				description="Choose what Fora sends you and when."
			/>

			<NotificationPreferences
				notificationsMuted={user.notificationsMuted}
				mutedCategories={user.mutedNotificationCategories}
			/>
		</div>
	);
}
