import { Button } from "@/components/ui/button";

type InviteMembersNavigationProps = {
	onContinue: () => void;
	onSkip: () => void;
	continueLabel: string;
	skipLabel?: string;
	isContinueDisabled?: boolean;
	isSubmitting?: boolean;
};

export function InviteMembersNavigation({
	onContinue,
	onSkip,
	continueLabel,
	skipLabel = "Skip for now",
	isContinueDisabled = false,
	isSubmitting = false,
}: InviteMembersNavigationProps) {
	return (
		<div className="flex flex-col gap-2 pt-4">
			<Button
				type="button"
				onClick={onContinue}
				disabled={isContinueDisabled || isSubmitting}
				className="h-11 w-full sm:h-12"
			>
				{isSubmitting ? "Creating workspace..." : continueLabel}
			</Button>
			<Button
				type="button"
				variant="outline"
				onClick={onSkip}
				className="h-11 w-full sm:h-12"
				disabled={isSubmitting}
			>
				{skipLabel}
			</Button>
		</div>
	);
}
