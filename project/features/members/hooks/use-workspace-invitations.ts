"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createWorkspaceInvitationsAction,
	resendWorkspaceInvitationAction,
	revokeWorkspaceInvitationAction,
} from "@/features/members/actions/workspaceInvitations";
import type { CreateWorkspaceInvitationInput } from "@/lib/validations/workspaceInvitation";

export function useWorkspaceInvitations(workspaceSlug: string) {
	const queryClient = useQueryClient();

	const refreshMembers = () =>
		queryClient.invalidateQueries({
			queryKey: ["workspace-members", workspaceSlug],
		});

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

			// Some invitations may have been sent successfully, but the email failed to send. Notify the user of this.
			const undelivered = result.results
				.filter((entry) => entry.success && entry.emailSent === false)
				.map((entry) => entry.email);

			if (undelivered.length > 0) {
				toast.warning(
					`Couldn't email ${undelivered.join(", ")}. Share the invite link manually, or verify a sending domain in Resend.`,
				);
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
				toast.error(result.message ?? "Failed to revoke invitation.");
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
				toast.error(result.message ?? "Failed to resend invitation.");
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
