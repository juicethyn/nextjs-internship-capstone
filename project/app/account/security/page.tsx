import { AccountHeader } from "@/features/account/components/account-header";

export default function SecurityPage() {
	return (
		<div className="space-y-6">
			<AccountHeader
				title="Security"
				description="Manage your password and sign-in methods."
			/>

			<div className="space-y-3 rounded-lg border p-4">
				<div>
					<h3 className="text-sm font-semibold">Nothing here yet</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Password and session controls are coming soon.
					</p>
				</div>
			</div>
		</div>
	);
}
