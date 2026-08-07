"use client";

import { InviteMembersStep } from "@/components/workspace-setup/invite-members/invite-members-step";
import { SetupLayout } from "@/components/workspace-setup/setup-layout";
import { WorkspaceStep } from "@/components/workspace-setup/workspace-step";
import { ONBOARDING_STEPS } from "@/constants/workspace-setup";
import { useCompleteOnboarding } from "@/hooks/use-complete-onboarding";
import { useStepFlow } from "@/hooks/use-step-flow";
import { SetupStep } from "@/types/workspace-setup";
import { ProfileStep } from "./profile/profile-step";

export function OnboardingFlow() {
	const { step, index, next, back } = useStepFlow(ONBOARDING_STEPS);
	const { completeOnboarding, isCompleting } = useCompleteOnboarding();

	return (
		<SetupLayout steps={ONBOARDING_STEPS} currentIndex={index}>
			{step.step === SetupStep.Workspace && <WorkspaceStep onNext={next} />}

			{step.step === SetupStep.InviteMembers && (
				<InviteMembersStep
					onBack={back}
					onContinue={next}
					onSkip={next}
					continueLabel="Continue"
				/>
			)}

			{step.step === SetupStep.Profile && (
				<ProfileStep
					onBack={back}
					onComplete={completeOnboarding}
					isSubmitting={isCompleting}
				/>
			)}
		</SetupLayout>
	);
}
