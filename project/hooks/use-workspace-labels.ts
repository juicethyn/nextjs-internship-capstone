"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createWorkspaceLabelAction,
	deleteWorkspaceLabelAction,
	getWorkspaceLabels,
} from "@/lib/actions/workspaceLabels";
import type { CreateWorkspaceLabelInput } from "@/lib/validations/label";

export function useWorkspaceLabels(workspaceSlug: string) {
	const queryClient = useQueryClient();

	const queryKey = ["workspace-labels", workspaceSlug];

	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const result = await getWorkspaceLabels(workspaceSlug);

			return result.data;
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateWorkspaceLabelInput) =>
			createWorkspaceLabelAction(workspaceSlug, data),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error ?? "Failed to create label.");
				return;
			}

			queryClient.invalidateQueries({ queryKey });
			toast.success("Label created.");
		},
		onError: () => toast.error("Failed to create label."),
	});

	const deleteMutation = useMutation({
		mutationFn: (labelId: string) =>
			deleteWorkspaceLabelAction(workspaceSlug, labelId),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error ?? "Failed to delete label.");
				return;
			}

			queryClient.invalidateQueries({ queryKey });
			toast.success("Label deleted.");
		},
		onError: () => toast.error("Failed to delete label."),
	});

	return {
		labels: query.data ?? [],
		isLoading: query.isLoading,
		createLabel: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		deleteLabel: deleteMutation.mutateAsync,
		deletingLabelId: deleteMutation.isPending ? deleteMutation.variables : null,
	};
}
