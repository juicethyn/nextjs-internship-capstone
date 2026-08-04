"use client";

import { Button } from "@/components/ui/button";
import type { Occupation } from "@/lib/db/schema";

type ProfileNavigationProps = {
	onBack: () => void;
	selectedOccupation: Occupation | null;
	isSubmitting: boolean;
	finishSetup: () => void;
};

export function ProfileNavigation({
	onBack,
	selectedOccupation,
	isSubmitting,
	finishSetup,
}: ProfileNavigationProps) {
	return (
		<div className="flex justify-between pt-4">
			<Button variant="ghost" onClick={onBack}>
				Back
			</Button>

			<Button disabled={!selectedOccupation} onClick={finishSetup}>
				{isSubmitting ? "Creating workspace..." : "Finish Setup"}
			</Button>
		</div>
	);
}
