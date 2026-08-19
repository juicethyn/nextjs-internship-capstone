import { AccountHeader } from "@/features/account/components/account-header";
import { ThemeCards } from "@/features/account/components/theme-cards";

export default function AppearancePage() {
	return (
		<div className="space-y-6">
			<AccountHeader
				title="Appearance"
				description="Choose how Fora looks on your device."
			/>

			<div className="space-y-3 rounded-lg border p-4">
				<div>
					<h3 className="text-sm font-semibold">Theme</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Select a color theme for the interface.
					</p>
				</div>

				<ThemeCards />
			</div>
		</div>
	);
}
