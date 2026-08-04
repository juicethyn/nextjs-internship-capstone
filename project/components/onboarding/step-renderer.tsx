import type { Occupation } from "@/lib/db/schema";
import { OnboardingStep } from "@/types/onboarding";
import { InviteMembersStep } from "./invite-members/invite-members-step";
import { ProfileStep } from "./profile/profile-step";
import { WorkspaceStep } from "./workspace-step";

type StepRendererProps = {
	step: OnboardingStep;
	onNext: () => void;
	onBack: () => void;
	onComplete: (occupation: Occupation) => Promise<void>;
	nextLabel: string;
};

export function StepRenderer({
	step,
	onNext,
	onBack,
	onComplete,
	nextLabel,
}: StepRendererProps) {
	switch (step) {
		case OnboardingStep.Workspace:
			return <WorkspaceStep onNext={onNext} />;

		case OnboardingStep.InviteMembers:
			return (
				<InviteMembersStep
					onBack={onBack}
					onNext={onNext}
					nextLabel={nextLabel}
				/>
			);

		case OnboardingStep.Profile:
			return <ProfileStep onBack={onBack} onComplete={onComplete} />;

		default:
			return null;
	}
}
