import { AccountHeader } from "@/features/account/components/account-header";
import { ConnectedAccountsSection } from "@/features/account/components/security/connected-accounts-section";
import { EmailSection } from "@/features/account/components/security/email-section";
import { PasswordSection } from "@/features/account/components/security/password-section";

export default function SecurityPage() {
	return (
		<div className="space-y-6">
			<AccountHeader
				title="Security"
				description="Manage your email, password, and sign-in methods."
			/>

			<EmailSection />

			<PasswordSection />

			<ConnectedAccountsSection />
		</div>
	);
}
