"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import type { Occupation } from "@/lib/db/schema";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ONBOARDING_FLOWS } from "@/types/onboarding";
import { Button } from "../ui/button";
import { OnboardingSidebar } from "./onboarding-sidebar";
import { StepRenderer } from "./step-renderer";

type OnboardingContainerProps = {
	mode: keyof typeof ONBOARDING_FLOWS;
	onClose?: () => void;
	onComplete?: () => void;
	isSubmitting?: boolean;
};

export function OnboardingContainer({
	mode,
	onClose,
	onComplete,
	isSubmitting = false,
}: OnboardingContainerProps) {
	const router = useRouter();
	const steps = ONBOARDING_FLOWS[mode];

	const [currentStep, setCurrentStep] = useState(steps[0]);
	const currentIndex = steps.findIndex((step) => step.id === currentStep.id);

	const next = () => {
		if (isSubmitting) return;

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
	const nextLabel = isLastStep ? "Create workspace" : "Continue";

	const handleOnboardingComplete = async (occupation: Occupation) => {
		const { workspace, invites, reset } = useOnboardingStore.getState();

		if (!workspace) return;

		const result = await completeOnboardingAction({
			workspace,
			invites,
			occupation,
		});

		if (!result?.success) {
			return;
		}

		reset();

		router.push(`/w/${result.data?.slug}/dashboard`);
		toast.success("Welcome to Fora!");
	};

	return (
		<div className="relative flex h-screen w-screen bg-background">
			<OnboardingSidebar steps={steps} currentStep={currentStep} />

			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-2xl px-3 sm:px-6 lg:px-8">
					<StepRenderer
						step={currentStep.step}
						onNext={next}
						onBack={back}
						nextLabel={nextLabel}
						onComplete={handleOnboardingComplete}
						isSubmitting={isSubmitting}
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
