"use client";

import { useState } from "react";
import { OnboardingStep } from "@/types/onboarding";
import { InviteMembersStep } from "./invite-members-step";
import { OnboardingSidebar } from "./onboarding-sidebar";
import { ProfileStep } from "./profile-step";
import { WorkspaceStep } from "./workspace-step";

const STEPS_ORDER = [
	OnboardingStep.Workspace,
	OnboardingStep.InviteMembers,
	OnboardingStep.Profile,
];

export function OnboardingContainer() {
	const [currentStep, setStep] = useState(OnboardingStep.Workspace);

	const currentStepIndex = STEPS_ORDER.indexOf(currentStep);

	const displayStepIndex = currentStepIndex + 1;

	const canGoBack = currentStepIndex > 0;
	const canGoNext = currentStepIndex < STEPS_ORDER.length - 1;

	const goNext = () => {
		if (!canGoNext) return;

		setStep(STEPS_ORDER[currentStepIndex + 1]);
	};

	const goBack = () => {
		if (!canGoBack) return;

		setStep(STEPS_ORDER[currentStepIndex - 1]);
	};

	const renderStep = () => {
		switch (currentStep) {
			case OnboardingStep.Workspace:
				return <WorkspaceStep onNext={goNext} currentStep={displayStepIndex} />;

			case OnboardingStep.InviteMembers:
				return (
					<InviteMembersStep
						onBack={goBack}
						onNext={goNext}
						currentStep={displayStepIndex}
					/>
				);

			case OnboardingStep.Profile:
				return <ProfileStep onBack={goBack} currentStep={displayStepIndex} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-dvh">
			<OnboardingSidebar currentStep={displayStepIndex} />
			<div className="flex flex-1 items-center justify-center p-10">
				<div className="w-full max-w-2xl">{renderStep()}</div>
			</div>
		</div>
	);
}
