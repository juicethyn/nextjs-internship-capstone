import { useState } from "react";
import { useProfileSetup } from "@/hooks/use-profile-setup";
import type { Occupation } from "@/lib/db/schema";
import { ProfileForm } from "./profile-form";
import { ProfileHeader } from "./profile-header";
import { ProfileNavigation } from "./profile-navigation";

type ProfileStepProps = {
	onBack: () => void;
	onComplete: (occupation: Occupation) => Promise<void>;
};

export function ProfileStep({ onBack, onComplete }: ProfileStepProps) {
	const { selectedOccupation, updateOccupation } = useProfileSetup();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFinish = async () => {
		if (!selectedOccupation) return;

		setIsSubmitting(true);

		try {
			await onComplete(selectedOccupation);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-8">
			<ProfileHeader />

			<ProfileForm
				selectedOccupation={selectedOccupation}
				updateOccupation={updateOccupation}
			/>

			<ProfileNavigation
				onBack={onBack}
				selectedOccupation={selectedOccupation}
				isSubmitting={isSubmitting}
				finishSetup={handleFinish}
			/>
		</div>
	);
}
