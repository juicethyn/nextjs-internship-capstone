import { Button } from "@/components/ui/button";

type InviteMembersNavigationProps = {
	onContinue: () => void;
	onSkip: () => void;
	nextLabel: string;
	skipLabel?: string;
	isContinueDisabled?: boolean;
};

export function InviteMembersNavigation({
	onContinue,
	onSkip,
	nextLabel,
	skipLabel = "Skip for now",
	isContinueDisabled = false,
}: InviteMembersNavigationProps) {
	return (
		<div className="flex flex-col gap-2 pt-4">
			<Button
				type="button"
				onClick={onContinue}
				disabled={isContinueDisabled}
				className="h-11 w-full sm:h-12"
			>
				{nextLabel}
			</Button>

			<Button
				type="button"
				variant="outline"
				onClick={onSkip}
				className="h-11 w-full sm:h-12"
			>
				{skipLabel}
			</Button>
		</div>
	);
}
