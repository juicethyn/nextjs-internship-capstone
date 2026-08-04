import { useState } from "react";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import type { Occupation } from "@/lib/db/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function useProfileSetup() {
	const { workspace, invites, occupation, setOccupation, reset } =
		useOnboardingStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedOccupation, setSelectedOccupation] =
		useState<Occupation | null>(occupation);

	const finishSetup = async () => {
		if (!workspace || !selectedOccupation) return;

		setIsSubmitting(true);

		setOccupation(selectedOccupation);

		try {
			await completeOnboardingAction({
				workspace,
				invites,
				occupation: selectedOccupation,
			});

			reset();
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateOccupation = (occupation: Occupation) => {
		setSelectedOccupation(occupation);
	};

	return {
		selectedOccupation,
		updateOccupation,
		isSubmitting,
		finishSetup,
	};
}
