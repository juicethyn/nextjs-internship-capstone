"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createListAction,
	deleteListAction,
	updateListAction,
} from "@/lib/actions/lists";
import type { CreateListInput, UpdateListInput } from "@/lib/validations/list";

interface UseListsProps {
	workspaceSlug: string;
	projectSlug: string;
}

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useLists({ workspaceSlug, projectSlug }: UseListsProps) {
	const queryClient = useQueryClient();

	const invalidateProject = () =>
		queryClient.invalidateQueries({
			queryKey: ["project", workspaceSlug, projectSlug],
		});

	const createMutation = useMutation({
		mutationFn: (data: CreateListInput) =>
			createListAction(workspaceSlug, projectSlug, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to create list."));
				return;
			}

			toast.success("List created.");
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to create list.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ listId, data }: { listId: string; data: UpdateListInput }) =>
			updateListAction(workspaceSlug, projectSlug, listId, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to update list."));
				return;
			}

			toast.success("List updated.");
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to update list.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (listId: string) =>
			deleteListAction(workspaceSlug, projectSlug, listId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to delete list."));
				return;
			}

			toast.success("List deleted.");
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to delete list.");
		},
	});

	return {
		createList: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		updateList: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		deleteList: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
