import { AccountHeader } from "@/features/account/components/account-header";

export default function NotificationsPage() {
	return (
		<div className="space-y-6">
			<AccountHeader
				title="Notifications"
				description="Choose what Fora sends you and when."
			/>

			<div className="space-y-3 rounded-lg border p-4">
				<div>
					<h3 className="text-sm font-semibold">Nothing here yet</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Notification preferences are coming soon.
					</p>
				</div>
			</div>
		</div>
	);
}
