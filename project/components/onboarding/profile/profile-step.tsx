import { useState } from "react";
import type { Occupation } from "@/lib/db/schema";
import { ProfileForm } from "./profile-form";
import { ProfileHeader } from "./profile-header";
import { ProfileNavigation } from "./profile-navigation";

type ProfileStepProps = {
	onBack: () => void;
	onComplete: (occupation: Occupation) => Promise<void>;
	isSubmitting: boolean;
};

export function ProfileStep({
	onBack,
	onComplete,
	isSubmitting,
}: ProfileStepProps) {
	const [selectedOccupation, setSelectedOccupation] =
		useState<Occupation | null>(null);

	const handleFinish = () => {
		if (!selectedOccupation || isSubmitting) return;

		onComplete(selectedOccupation);
	};

	return (
		<div className="mx-auto w-full max-w-xl space-y-4 lg:space-y-5">
			<ProfileHeader onBack={onBack} />

			<ProfileForm
				selectedOccupation={selectedOccupation}
				updateOccupation={setSelectedOccupation}
			/>

			<ProfileNavigation
				selectedOccupation={!!selectedOccupation}
				isSubmitting={isSubmitting}
				finishSetup={handleFinish}
			/>
		</div>
	);
}
