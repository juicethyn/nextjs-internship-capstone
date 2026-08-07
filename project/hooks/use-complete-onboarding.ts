"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import type { Occupation } from "@/lib/db/schema";
import { useWorkspaceSetupStore } from "@/stores/workspace-setup-store";

export function useCompleteOnboarding() {
	const router = useRouter();
	const [isCompleting, setIsCompleting] = useState(false);
	const isCompletingRef = useRef(false);

	const completeOnboarding = async (occupation: Occupation) => {
		if (isCompletingRef.current) return;
		isCompletingRef.current = true;
		setIsCompleting(true);

		try {
			const { workspace, invites, reset } = useWorkspaceSetupStore.getState();

			if (!workspace) return;

			const result = await completeOnboardingAction({
				workspace,
				invites,
				occupation,
			});

			if (!result.success) {
				toast.error(result.message ?? "Failed to complete onboarding.");
				return;
			}

			const workspaceSlug = result.data?.slug;

			if (!workspaceSlug) {
				toast.error("Failed to complete onboarding.");
				return;
			}

			reset();

			router.push(`/w/${workspaceSlug}/dashboard`);

			toast.success("Welcome to Fora!");
		} finally {
			isCompletingRef.current = false;
			setIsCompleting(false);
		}
	};

	return {
		completeOnboarding,
		isCompleting,
	};
}
