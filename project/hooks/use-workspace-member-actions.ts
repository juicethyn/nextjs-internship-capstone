"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	removeWorkspaceMemberAction,
	updateWorkspaceMemberRoleAction,
} from "@/lib/actions/workspaceMembers";
import type { WorkspaceMemberRole } from "@/types/workspace";

export function useWorkspaceMemberActions(workspaceSlug: string) {
	const queryClient = useQueryClient();

	// Prefix match: refreshes the members page's ["...", slug, "stats"] query and
	// the lighter ["workspace-members", slug] list in one call.
	const refreshMembers = () =>
		queryClient.invalidateQueries({
			queryKey: ["workspace-members", workspaceSlug],
		});

	const updateRoleMutation = useMutation({
		mutationFn: ({
			userId,
			role,
		}: {
			userId: string;
			role: Exclude<WorkspaceMemberRole, "owner">;
		}) => updateWorkspaceMemberRoleAction(workspaceSlug, userId, role),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(result.message);
			refreshMembers();
		},

		onError: () => {
			toast.error("Failed to update role.");
		},
	});

	const removeMutation = useMutation({
		mutationFn: (memberId: string) =>
			removeWorkspaceMemberAction(workspaceSlug, memberId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(result.message);
			refreshMembers();
		},

		onError: () => {
			toast.error("Failed to remove member.");
		},
	});

	return {
		updateRole: updateRoleMutation.mutateAsync,
		updatingUserId: updateRoleMutation.isPending
			? updateRoleMutation.variables.userId
			: null,

		removeMember: removeMutation.mutateAsync,
		removingMemberId: removeMutation.isPending
			? removeMutation.variables
			: null,
	};
}
