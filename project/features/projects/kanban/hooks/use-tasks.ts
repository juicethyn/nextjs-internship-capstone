"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	addTaskLabelToTaskAction,
	removeTaskLabelFromTaskAction,
} from "@/features/labels/actions/taskLabelAssignments";
import {
	createTaskAction,
	deleteTaskAction,
	moveTaskAction,
	updateTaskAction,
} from "@/features/projects/kanban/actions/tasks";
import {
	applyTaskLabels,
	applyTaskMove,
} from "@/features/projects/kanban/lib/board-dnd";
import type { ProjectDetail } from "@/features/projects/types";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/task";

interface UseTasksProps {
	workspaceSlug: string;
	projectSlug: string;
}

type TaskLabelOption =
	ProjectDetail["lists"][number]["tasks"][number]["taskLabels"][number]["taskLabel"];

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useTasks({ workspaceSlug, projectSlug }: UseTasksProps) {
	const queryClient = useQueryClient();

	const queryKey = ["project", workspaceSlug, projectSlug];

	const invalidateProject = () => {
		queryClient.invalidateQueries({ queryKey });

		return queryClient.invalidateQueries({
			queryKey: ["dashboard", workspaceSlug],
		});
	};

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

	// Label assignment used to be raw server-action calls from the dialog, which
	// never touched React Query — hence needing a refresh to see the change.
	const setLabelsMutation = useMutation({
		mutationFn: async ({
			taskId,
			added,
			removed,
		}: {
			taskId: string;
			added: string[];
			removed: string[];
			labels: TaskLabelOption[];
		}) =>
			Promise.all([
				...added.map((labelId) =>
					addTaskLabelToTaskAction(workspaceSlug, projectSlug, taskId, labelId),
				),
				...removed.map((labelId) =>
					removeTaskLabelFromTaskAction(
						workspaceSlug,
						projectSlug,
						taskId,
						labelId,
					),
				),
			]),

		onMutate: async ({ taskId, labels }) => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<ProjectDetail>(queryKey);

			queryClient.setQueryData<ProjectDetail>(queryKey, (current) =>
				current ? applyTaskLabels(current, taskId, labels) : current,
			);

			return { previous };
		},

		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			toast.error("Failed to update labels.");
		},

		onSuccess: (results) => {
			if (results.some((result) => !result.success)) {
				toast.error("Some labels could not be updated.");
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

		setTaskLabels: setLabelsMutation.mutateAsync,
		isSettingLabels: setLabelsMutation.isPending,

		updateTask: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		deleteTask: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
