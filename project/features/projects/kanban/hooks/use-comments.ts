"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createCommentAction,
	deleteCommentAction,
	getCommentsByTaskAction,
} from "@/features/projects/kanban/actions/comments";
import { useCurrentUser } from "@/hooks/use-user";
import type { CreateCommentInput } from "@/lib/validations/comment";

type CommentsSuccess = Extract<
	Awaited<ReturnType<typeof getCommentsByTaskAction>>,
	{ data: unknown }
>;

export type TaskComment = CommentsSuccess["data"][number];

export const PENDING_COMMENT_PREFIX = "pending-";

interface UseCommentsProps {
	workspaceSlug: string;
	projectSlug: string;
	taskId: string;
	enabled?: boolean;
}

export function useComments({
	workspaceSlug,
	projectSlug,
	taskId,
	enabled = true,
}: UseCommentsProps) {
	const queryClient = useQueryClient();
	const { user } = useCurrentUser();

	const queryKey = ["comments", workspaceSlug, projectSlug, taskId];

	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const result = await getCommentsByTaskAction(
				workspaceSlug,
				projectSlug,
				taskId,
			);

			return result.success ? result.data : [];
		},
		enabled,
	});

	const invalidateAll = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey }),
			queryClient.invalidateQueries({
				queryKey: ["project", workspaceSlug, projectSlug],
			}),
			queryClient.invalidateQueries({
				queryKey: ["dashboard", workspaceSlug],
			}),
		]);

	const buildOptimisticComment = (content: string): TaskComment => ({
		id: `${PENDING_COMMENT_PREFIX}${crypto.randomUUID()}`,
		content,
		taskId,
		authorId: "pending",
		createdAt: new Date(),
		updatedAt: new Date(),
		isOwn: true,
		author: {
			id: "pending",
			clerkId: "pending",
			email: "",
			firstName: user?.firstName ?? "You",
			lastName: user?.lastName ?? "",
			imageUrl: user?.imageUrl ?? null,
			occupation: null,
			lastWorkspaceId: null,
			notificationsMuted: false,
			mutedNotificationCategories: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateCommentInput) =>
			createCommentAction(workspaceSlug, projectSlug, taskId, data),

		onMutate: async ({ content }) => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<TaskComment[]>(queryKey);

			queryClient.setQueryData<TaskComment[]>(queryKey, (current) => [
				...(current ?? []),
				buildOptimisticComment(content),
			]);

			return { previous };
		},

		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			toast.error("Failed to post comment.");
		},

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to post comment.");
			}
		},

		onSettled: () => invalidateAll(),
	});

	const deleteMutation = useMutation({
		mutationFn: (commentId: string) =>
			deleteCommentAction(workspaceSlug, projectSlug, commentId),

		onMutate: async (commentId) => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<TaskComment[]>(queryKey);

			queryClient.setQueryData<TaskComment[]>(queryKey, (current) =>
				(current ?? []).filter((comment) => comment.id !== commentId),
			);

			return { previous };
		},

		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}

			toast.error("Failed to delete comment.");
		},

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to delete comment.");
				return;
			}

			toast.success("Comment deleted.");
		},

		onSettled: () => invalidateAll(),
	});

	return {
		comments: query.data ?? [],
		isLoading: query.isLoading,

		createComment: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		deleteComment: deleteMutation.mutateAsync,
		deletingCommentId: deleteMutation.isPending
			? deleteMutation.variables
			: null,
	};
}
