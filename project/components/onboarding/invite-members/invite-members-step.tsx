import { useOnboardingStore } from "@/stores/onboarding-store";
import { InviteMembersForm } from "./invite-members-form";
import { InviteMembersHeader } from "./invite-members-header";
import { InviteMembersLists } from "./invite-members-list";
import { InviteMembersNavigation } from "./invite-members-navigation";

type InviteMembersStepProps = {
	onBack: () => void;
	onNext: () => void;
	onSkip: () => void;
	nextLabel: string;
	isSubmitting: boolean;
};

export function InviteMembersStep({
	onBack,
	onNext,
	onSkip,
	nextLabel,
	isSubmitting,
}: InviteMembersStepProps) {
	const { invites } = useOnboardingStore();

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
				onContinue={onNext}
				onSkip={onSkip}
				nextLabel={nextLabel}
				isContinueDisabled={invites.length === 0}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
}
