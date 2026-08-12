"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createTaskLabelAction,
	deleteTaskLabelAction,
	getTaskLabelsByProjectAction,
} from "@/lib/actions/taskLabels";
import type { CreateTaskLabelInput } from "@/lib/validations/label";

interface UseTaskLabelsProps {
	workspaceSlug: string;
	projectSlug: string;
	enabled?: boolean;
}

export function useTaskLabels({
	workspaceSlug,
	projectSlug,
	enabled = true,
}: UseTaskLabelsProps) {
	const queryClient = useQueryClient();

	const queryKey = ["task-labels", workspaceSlug, projectSlug];

	const query = useQuery({
		queryKey,
		queryFn: () => getTaskLabelsByProjectAction(workspaceSlug, projectSlug),
		enabled,
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateTaskLabelInput) =>
			createTaskLabelAction(workspaceSlug, projectSlug, data),

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
			deleteTaskLabelAction(workspaceSlug, projectSlug, labelId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error ?? "Failed to delete label.");
				return;
			}

			// task_label_assignments cascades, so the label vanishes from every card
			// too — the board reads those from the project query, not this one.
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({
				queryKey: ["project", workspaceSlug, projectSlug],
			});

			toast.success("Label deleted.");
		},

		onError: () => toast.error("Failed to delete label."),
	});

	return {
		taskLabels: query.data ?? [],
		isLoading: query.isLoading,

		createLabel: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		deleteLabel: deleteMutation.mutateAsync,
		deletingLabelId: deleteMutation.isPending ? deleteMutation.variables : null,
	};
}
