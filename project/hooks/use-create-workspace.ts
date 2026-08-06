"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	createWorkspaceAction,
	switchWorkspaceAction,
} from "@/lib/actions/workspaces";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function useCreateWorkspace() {
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const isCreatingRef = useRef(false);

	const createWorkspace = async () => {
		if (isCreatingRef.current) return;
		isCreatingRef.current = true;
		setIsCreating(true);

		try {
			const { workspace, invites, reset } = useOnboardingStore.getState();

			if (!workspace) return;

			const result = await createWorkspaceAction({
				workspace,
				invites,
			});

			if (!result.success) {
				toast.error(result.message ?? "Failed to create workspace.");
				return;
			}

			const workspaceSlug = result.data?.slug;

			if (!workspaceSlug) {
				toast.error("Failed to create workspace.");
				return;
			}

			await switchWorkspaceAction(workspaceSlug);

			reset();

			toast.success(`Workspace ${workspace.name} created successfully!`);

			router.push(`/w/${workspaceSlug}/dashboard`);

			return true;
		} finally {
			isCreatingRef.current = false;
			setIsCreating(false);
		}
	};

	return {
		createWorkspace,
		isCreating,
	};
}
