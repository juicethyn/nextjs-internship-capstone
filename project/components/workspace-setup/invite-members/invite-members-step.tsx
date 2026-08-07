import { useWorkspaceSetupStore } from "@/stores/workspace-setup-store";
import { InviteMembersForm } from "./invite-members-form";
import { InviteMembersHeader } from "./invite-members-header";
import { InviteMembersLists } from "./invite-members-list";
import { InviteMembersNavigation } from "./invite-members-navigation";

type InviteMembersStepProps = {
	onBack: () => void;
	onContinue: () => void;
	onSkip: () => void;
	continueLabel: string;
	isSubmitting?: boolean;
};

export function InviteMembersStep({
	onBack,
	onContinue,
	onSkip,
	continueLabel,
	isSubmitting = false,
}: InviteMembersStepProps) {
	const { invites } = useWorkspaceSetupStore();

	return (
		<div className="mx-auto w-full max-w-xl space-y-4 lg:space-y-5">
			{/* Header */}
			<InviteMembersHeader onBack={onBack} />

			{/* Invite Form */}
			<InviteMembersForm />

			{/* Invite List */}
			<InviteMembersLists />

			{/* Navigation */}
			<InviteMembersNavigation
				onContinue={onContinue}
				onSkip={onSkip}
				continueLabel={continueLabel}
				isContinueDisabled={invites.length === 0}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
