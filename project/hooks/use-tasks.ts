"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createTaskAction,
	deleteTaskAction,
	updateTaskAction,
} from "@/lib/actions/tasks";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/task";

interface UseTasksProps {
	workspaceSlug: string;
	projectSlug: string;
}

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useTasks({ workspaceSlug, projectSlug }: UseTasksProps) {
	const queryClient = useQueryClient();

	const invalidateProject = () =>
		queryClient.invalidateQueries({
			queryKey: ["project", workspaceSlug, projectSlug],
		});

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

	return {
		createTask: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		updateTask: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		deleteTask: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
