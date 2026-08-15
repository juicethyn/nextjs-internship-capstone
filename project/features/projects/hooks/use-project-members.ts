"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	addProjectMembersAction,
	removeProjectMemberAction,
	transferProjectLeadAction,
} from "@/features/projects/actions/projectMembers";

interface UseProjectMembersProps {
	workspaceSlug: string;
	projectSlug: string;
}

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useProjectMembers({
	workspaceSlug,
	projectSlug,
}: UseProjectMembersProps) {
	const queryClient = useQueryClient();

	// The roster lives inside the cached ProjectDetail, so invalidating the
	// project refreshes the header stack, the invite dialog and the members tab.
	const invalidateProject = () => {
		queryClient.invalidateQueries({
			queryKey: ["project", workspaceSlug, projectSlug],
		});

		return queryClient.invalidateQueries({
			queryKey: ["dashboard", workspaceSlug],
		});
	};

	const addMutation = useMutation({
		mutationFn: (userIds: string[]) =>
			addProjectMembersAction(workspaceSlug, projectSlug, { userIds }),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to add members."));
				return;
			}

			toast.success(toMessage(result.message, "Members added."));
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to add members.");
		},
	});

	const removeMutation = useMutation({
		mutationFn: (userId: string) =>
			removeProjectMemberAction(workspaceSlug, projectSlug, userId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to remove member."));
				return;
			}

			toast.success(toMessage(result.message, "Member removed."));
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to remove member.");
		},
	});

	const transferMutation = useMutation({
		mutationFn: (userId: string) =>
			transferProjectLeadAction(workspaceSlug, projectSlug, userId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to transfer lead."));
				return;
			}

			toast.success(toMessage(result.message, "Project lead transferred."));
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to transfer lead.");
		},
	});

	return {
		addMembers: addMutation.mutateAsync,
		isAdding: addMutation.isPending,

		removeMember: removeMutation.mutateAsync,
		removingUserId: removeMutation.isPending ? removeMutation.variables : null,

		transferLead: transferMutation.mutateAsync,
		transferringUserId: transferMutation.isPending
			? transferMutation.variables
			: null,
	};
}
