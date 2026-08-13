"use client";

import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding";
import { InviteMembersStep } from "@/features/workspace/setup/components/invite-members-step";
import { SetupLayout } from "@/features/workspace/setup/components/setup-layout";
import { WorkspaceStep } from "@/features/workspace/setup/components/workspace-step";
import { ONBOARDING_STEPS } from "@/features/workspace/setup/constants";
import { SetupStep } from "@/features/workspace/setup/types";
import { useStepFlow } from "@/hooks/use-step-flow";
import { ProfileStep } from "./profile-step";

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
