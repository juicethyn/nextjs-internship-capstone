"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
	createWorkspaceInvitationsAction,
	resendWorkspaceInvitationAction,
	revokeWorkspaceInvitationAction,
} from "@/lib/actions/workspaceInvitations";
import type { CreateWorkspaceInvitationInput } from "@/lib/validations/workspaceInvitation";

export function useWorkspaceInvitations(workspaceSlug: string) {
	const router = useRouter();

	// The members page reads server props, not a React Query cache, so
	// invalidateQueries would refresh nothing. The actions revalidatePath, and
	// router.refresh() is what re-runs the server component with that fresh data.
	const refreshMembers = () => router.refresh();

	const sendMutation = useMutation({
		mutationFn: (invites: CreateWorkspaceInvitationInput[]) =>
			createWorkspaceInvitationsAction(workspaceSlug, invites),

		onSuccess: (result) => {
			if ("message" in result && result.message) {
				toast.error(result.message);
				return;
			}

			const failed = result.results.filter((entry) => !entry.success);

			if (result.sentCount > 0) {
				toast.success(
					result.sentCount === 1
						? "Invitation sent."
						: `${result.sentCount} invitations sent.`,
				);
			}

			for (const entry of failed) {
				toast.error(`${entry.email}: ${entry.error}`);
			}

			if (result.sentCount > 0) {
				refreshMembers();
			}
		},

		onError: () => {
			toast.error("Failed to send invitations.");
		},
	});

	const revokeMutation = useMutation({
		mutationFn: (invitationId: string) =>
			revokeWorkspaceInvitationAction(workspaceSlug, invitationId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error ?? "Failed to revoke invitation.");
				return;
			}

			toast.success("Invitation revoked.");
			refreshMembers();
		},

		onError: () => {
			toast.error("Failed to revoke invitation.");
		},
	});

	const resendMutation = useMutation({
		mutationFn: (invitationId: string) =>
			resendWorkspaceInvitationAction(workspaceSlug, invitationId),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error ?? "Failed to resend invitation.");
				return;
			}

			toast.success("Invitation resent.");
			refreshMembers();
		},

		onError: () => {
			toast.error("Failed to resend invitation.");
		},
	});

	return {
		sendInvitations: sendMutation.mutateAsync,
		isSending: sendMutation.isPending,

		revokeInvitation: revokeMutation.mutateAsync,
		revokingInvitationId: revokeMutation.isPending
			? revokeMutation.variables
			: null,

		resendInvitation: resendMutation.mutateAsync,
		resendingInvitationId: resendMutation.isPending
			? resendMutation.variables
			: null,
	};
}
