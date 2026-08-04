import { useOnboardingStore } from "@/stores/onboarding-store";
import { useInvitationForm } from "./use-invitation-form";

export function useInviteMembers() {
	const form = useInvitationForm();

	const { invites, addInvite, removeInvite } = useOnboardingStore();

	const addInvitation = () => {
		const invite = form.validate();

		if (!invite) return;

		const exists = invites.some(
			(item) => item.email.toLowerCase() === invite.email.toLowerCase(),
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
