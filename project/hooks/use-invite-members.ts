import { useState } from "react";
import { createWorkspaceInvitationSchema } from "@/lib/validations/workspaceInvitation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { WorkspaceMemberRole } from "@/types/workspace";

export function useInviteMembers() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<WorkspaceMemberRole>("member");
	const [error, setError] = useState<string | null>(null);

	const { invites, addInvite } = useOnboardingStore();

	const updateEmail = (value: string) => {
		setEmail(value);

		if (error) {
			setError(null);
		}
	};

	const updateRole = (value: WorkspaceMemberRole) => {
		setRole(value);

		if (error) {
			setError(null);
		}
	};

	const AddInvite = () => {
		const normalizedEmail = email.trim().toLowerCase();

		const result = createWorkspaceInvitationSchema.safeParse({
			email: normalizedEmail,
			role,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		const alreadyExists = invites.some(
			(invite) => invite.email.toLowerCase() === normalizedEmail,
		);

		if (alreadyExists) {
			setError("This email has already been invited.");
			return;
		}

		addInvite(result.data);

		updateEmail(result.data.email);
		updateRole("member");
		setError(null);
	};

	const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;

		event.preventDefault();
		AddInvite();
	};

	return {
		email,
		role,
		error,

		updateEmail: setEmail,
		updateRole: setRole,

		AddInvite,
		handleEmailKeyDown,
	};
}
