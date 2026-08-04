import { UserPlus } from "lucide-react";
import { InviteMembersForm } from "./invite-members-form";
import { InviteMembersHeader } from "./invite-members-header";
import { InviteMembersLists } from "./invite-members-list";
import { InviteMembersNavigation } from "./invite-members-navigation";

type InviteMembersStepProps = {
	onBack: () => void;
	onNext: () => void;
	onComplete?: () => void;
	nextLabel: string;
};

export function InviteMembersStep({
	onBack,
	onNext,
	nextLabel,
}: InviteMembersStepProps) {
	return (
		<div className="space-y-8">
			{/* Header */}
			<InviteMembersHeader />

			{/* Invite Form */}
			<InviteMembersForm />

			{/* Invite List */}
			<InviteMembersLists />

			{/* Navigation */}
			<InviteMembersNavigation
				onBack={onBack}
				onNext={onNext}
				nextLabel={nextLabel}
			/>
		</div>
	);
}
