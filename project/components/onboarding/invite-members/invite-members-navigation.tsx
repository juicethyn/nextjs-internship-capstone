import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";

type InviteMembersNavigationProps = {
	onNext: () => void;
	onBack: () => void;
	nextLabel: string;
};

export function InviteMembersNavigation({
	onNext,
	onBack,
	nextLabel,
}: InviteMembersNavigationProps) {
	const { invites } = useOnboardingStore();

	const buttonLabel = invites.length === 0 ? `Skip & ${nextLabel}` : nextLabel;
	return (
		<div className="flex justify-between pt-4">
			<Button variant="ghost" onClick={onBack}>
				Back
			</Button>

			<Button onClick={onNext}>{buttonLabel}</Button>
		</div>
	);
}
