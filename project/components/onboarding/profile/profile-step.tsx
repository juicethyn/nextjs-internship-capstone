import { useProfileSetup } from "@/hooks/use-profile-setup";
import { ProfileForm } from "./profile-form";
import { ProfileHeader } from "./profile-header";
import { ProfileNavigation } from "./profile-navigation";

type Props = {
	onBack: () => void;
};

export function ProfileStep({ onBack }: Props) {
	const profile = useProfileSetup();

	return (
		<div className="space-y-8">
			<ProfileHeader />

			<ProfileForm
				selectedOccupation={profile.selectedOccupation}
				updateOccupation={profile.updateOccupation}
			/>

			<ProfileNavigation
				onBack={onBack}
				selectedOccupation={profile.selectedOccupation}
				isSubmitting={profile.isSubmitting}
				finishSetup={profile.finishSetup}
			/>
		</div>
	);
}
