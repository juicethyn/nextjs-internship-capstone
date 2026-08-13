"use client";

import { Button } from "@/components/ui/button";

type ProfileNavigationProps = {
	selectedOccupation: boolean;
	isSubmitting: boolean;
	finishSetup: () => void;
};

export function ProfileNavigation({
	selectedOccupation,
	isSubmitting,
	finishSetup,
}: ProfileNavigationProps) {
	return (
		<div className="flex justify-between pt-4">
			<Button
				type="button"
				onClick={finishSetup}
				disabled={isSubmitting || !selectedOccupation}
				className="h-11 w-full sm:h-12"
			>
				{isSubmitting ? "Creating workspace..." : "Create workspace"}
			</Button>
		</div>
	);
}
