import { useState } from "react";
import type { Occupation } from "@/lib/db/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function useProfileSetup() {
	const { occupation } = useOnboardingStore();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedOccupation, setSelectedOccupation] =
		useState<Occupation | null>(occupation);

	const updateOccupation = (occupation: Occupation) => {
		setSelectedOccupation(occupation);
	};

	return {
		selectedOccupation,
		updateOccupation,
		isSubmitting,
		setIsSubmitting,
	};
}
