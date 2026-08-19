"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createListAction,
	deleteListAction,
	moveListAction,
	updateListAction,
} from "@/features/projects/kanban/actions/lists";
import { applyListMove } from "@/features/projects/kanban/lib/board-dnd";
import type { ProjectDetail } from "@/features/projects/types";
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

	const queryKey = ["project", workspaceSlug, projectSlug];

	const invalidateProject = () => {
		queryClient.invalidateQueries({ queryKey });

		queryClient.invalidateQueries({ queryKey: ["calendar", workspaceSlug] });

		return queryClient.invalidateQueries({
			queryKey: ["dashboard", workspaceSlug],
		});
	};

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

	const moveMutation = useMutation({
		mutationFn: ({ listId, position }: { listId: string; position: number }) =>
			moveListAction(workspaceSlug, projectSlug, listId, position),

		onMutate: async ({ listId, position }) => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<ProjectDetail>(queryKey);

			queryClient.setQueryData<ProjectDetail>(queryKey, (current) =>
				current ? applyListMove(current, listId, position) : current,
			);

			return { previous };
		},

		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			toast.error("Failed to move list.");
		},

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to move list."));
			}
		},

		onSettled: () => invalidateProject(),
	});

	return {
		createList: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		moveList: moveMutation.mutateAsync,
		isMoving: moveMutation.isPending,

		updateList: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		deleteList: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
