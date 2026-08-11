"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createTaskAction,
	deleteTaskAction,
	moveTaskAction,
	updateTaskAction,
} from "@/lib/actions/tasks";
import { applyTaskMove } from "@/lib/utils/board-dnd";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/task";
import type { ProjectDetail } from "@/types/projects";

interface UseTasksProps {
	workspaceSlug: string;
	projectSlug: string;
}

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useTasks({ workspaceSlug, projectSlug }: UseTasksProps) {
	const queryClient = useQueryClient();

	const queryKey = ["project", workspaceSlug, projectSlug];

	const invalidateProject = () => queryClient.invalidateQueries({ queryKey });

	const createMutation = useMutation({
		mutationFn: ({ listId, data }: { listId: string; data: CreateTaskInput }) =>
			createTaskAction(workspaceSlug, projectSlug, listId, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to create task."));
				return;
			}

			toast.success("Card created.");
			return invalidateProject();
		},

		onError: () => {
			toast.error("Failed to create task.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
			updateTaskAction(workspaceSlug, projectSlug, taskId, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to update task."));
				return;
			}

			toast.success("Task updated.");
			return invalidateProject();
		},

		onError: () => {
			toast.error("Failed to update task.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (taskId: string) =>
			deleteTaskAction(workspaceSlug, projectSlug, taskId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to delete task."));
				return;
			}

			toast.success("Card deleted.");
			return invalidateProject();
		},

		onError: () => {
			toast.error("Failed to delete task.");
		},
	});

	// Silent on success, like moveList — the board is its own feedback.
	const moveMutation = useMutation({
		mutationFn: ({
			taskId,
			destinationListId,
			position,
		}: {
			taskId: string;
			destinationListId: string;
			position: number;
		}) =>
			moveTaskAction(
				workspaceSlug,
				projectSlug,
				taskId,
				destinationListId,
				position,
			),

		onMutate: async ({ taskId, destinationListId, position }) => {
			// Without this, a refetch already in flight can resolve after the
			// optimistic write and snap the card back to its old slot.
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<ProjectDetail>(queryKey);

			queryClient.setQueryData<ProjectDetail>(queryKey, (current) =>
				current
					? applyTaskMove(current, taskId, destinationListId, position)
					: current,
			);

			return { previous };
		},

		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			toast.error("Failed to move card.");
		},

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to move card."));
			}
		},

		onSettled: () => invalidateProject(),
	});

	// Cache-only relocation used during onDragOver so the gap opens in the target
	// list mid-drag. No server call — onDragEnd is what persists.
	const previewTaskMove = (
		taskId: string,
		destinationListId: string,
		position: number,
	) =>
		queryClient.setQueryData<ProjectDetail>(queryKey, (current) =>
			current
				? applyTaskMove(current, taskId, destinationListId, position)
				: current,
		);

	return {
		createTask: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		moveTask: moveMutation.mutateAsync,
		isMoving: moveMutation.isPending,
		previewTaskMove,

		updateTask: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		deleteTask: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
