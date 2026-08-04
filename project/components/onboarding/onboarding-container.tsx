"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { ONBOARDING_FLOWS } from "@/types/onboarding";
import { Button } from "../ui/button";
import { OnboardingSidebar } from "./onboarding-sidebar";
import { StepRenderer } from "./step-renderer";

type OnboardingContainerProps = {
	mode: keyof typeof ONBOARDING_FLOWS;
	onClose?: () => void;
	onComplete?: () => void;
};

export function OnboardingContainer({
	mode,
	onClose,
	onComplete,
}: OnboardingContainerProps) {
	const steps = ONBOARDING_FLOWS[mode];

	const [currentStep, setCurrentStep] = useState(steps[0]);
	const currentIndex = steps.findIndex((step) => step.id === currentStep.id);

	const next = () => {
		const nextStep = steps[currentIndex + 1];

		if (nextStep) {
			setCurrentStep(nextStep);
			return;
		}

		onComplete?.();
	};

	const back = () => {
		const previousStep = steps[currentIndex - 1];

		if (previousStep) {
			setCurrentStep(previousStep);
		}
	};

	const isLastStep = currentIndex === steps.length - 1;
	const nextLabel = isLastStep ? "Finish Setup" : "Continue";

	return (
		<div className="relative flex h-screen w-screen bg-background">
			<OnboardingSidebar steps={steps} currentStep={currentStep} />

			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-2xl px-10">
					<StepRenderer
						step={currentStep.step}
						onNext={next}
						onBack={back}
						nextLabel={nextLabel}
					/>
				</div>
			</div>

			{onClose && (
				<Button
					onClick={onClose}
					variant="ghost"
					className="absolute right-6 top-6"
				>
					<X />
				</Button>
			)}
		</div>
	);
}
