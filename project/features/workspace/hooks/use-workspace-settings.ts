"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	transferWorkspaceOwnershipAction,
	updateWorkspaceAction,
} from "@/features/workspace/actions/workspaces";
import type { WorkspaceGeneralSettingsInput } from "@/lib/validations/workspace";

export function useWorkspaceSettings(workspaceSlug: string) {
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: WorkspaceGeneralSettingsInput) =>
			updateWorkspaceAction(workspaceSlug, data),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to update workspace.");
				return;
			}

			router.refresh();
			toast.success("Workspace updated.");
		},
		onError: () => toast.error("Failed to update workspace."),
	});

	const transferMutation = useMutation({
		mutationFn: (newOwnerUserId: string) =>
			transferWorkspaceOwnershipAction(workspaceSlug, newOwnerUserId),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to transfer ownership.");
				return;
			}

			router.refresh();
			toast.success("Ownership transferred.");
		},
		onError: () => toast.error("Failed to transfer ownership."),
	});

	return {
		updateWorkspace: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		transferOwnership: transferMutation.mutateAsync,
		isTransferring: transferMutation.isPending,
	};
}
