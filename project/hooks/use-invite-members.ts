import { useWorkspaceSetupStore } from "@/stores/workspace-setup-store";
import { useInvitationForm } from "./use-invitation-form";

export function useInviteMembers(currentUserEmail: string) {
	const form = useInvitationForm();

	const { invites, addInvite, removeInvite } = useWorkspaceSetupStore();

	const addInvitation = () => {
		const invite = form.validate();

		if (!invite) return;

		const normalizedInviteEmail = invite.email.trim().toLowerCase();
		const normalizedCurrentUserEmail = currentUserEmail.trim().toLowerCase();

		if (normalizedInviteEmail === normalizedCurrentUserEmail) {
			form.setError("You cannot invite yourself to this workspace.");
			return;
		}

		const exists = invites.some(
			(item) => item.email.toLowerCase() === normalizedInviteEmail,
		);

		if (exists) {
			form.setError("This email has already been invited.");
			return;
		}

		addInvite(invite);
		form.reset();
	};

	return {
		...form,
		invites,
		removeInvite,
		addInvitation,
	};
}
