"use client";

import { Button } from "@/components/ui/button";
import type { Occupation } from "@/lib/db/schema";

type ProfileNavigationProps = {
	selectedOccupation: Occupation | null;
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
				disabled={!selectedOccupation}
				className="h-11 w-full sm:h-12"
			>
				{isSubmitting ? "Creating workspace..." : "Create workspace"}
			</Button>
		</div>
	);
}
