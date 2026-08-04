"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
	createWorkspaceInvitationAction,
	resendWorkspaceInvitationAction,
	revokeWorkspaceInvitationAction,
} from "@/lib/actions/workspaceInvitations";

export function useWorkspaceInvitations(workspaceSlug: string) {
	const [isLoading, setIsLoading] = useState(false);

	const createInvitation = async (data: {
		email: string;
		role: "member" | "admin";
	}) => {
		setIsLoading(true);

		try {
			const result = await createWorkspaceInvitationAction(workspaceSlug, data);

			if (!result.success) {
				toast.error(result.error);
				return false;
			}

			toast.success("Invitation sent successfully!");

			return true;
		} finally {
			setIsLoading(false);
		}
	};

	const resendInvitation = async (invitationId: string) => {
		setIsLoading(true);

		try {
			const result = await resendWorkspaceInvitationAction(
				workspaceSlug,
				invitationId,
			);

			if (!result.success) {
				toast.error(result.error);
				return false;
			}

			toast.success("Invitation resent!");

			return true;
		} finally {
			setIsLoading(false);
		}
	};

	const revokeInvitation = async (invitationId: string) => {
		setIsLoading(true);

		try {
			const result = await revokeWorkspaceInvitationAction(
				workspaceSlug,
				invitationId,
			);

			if (!result.success) {
				toast.error(result.error);
				return false;
			}

			toast.success("Invitation revoked");

			return true;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,

		createInvitation,
		resendInvitation,
		revokeInvitation,
	};
}
