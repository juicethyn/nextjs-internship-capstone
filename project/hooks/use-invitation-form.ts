import { useState } from "react";
import { createWorkspaceInvitationSchema } from "@/lib/validations/workspaceInvitation";
import type { WorkspaceMemberRole } from "@/types/workspace";

export function useInvitationForm() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<WorkspaceMemberRole>("member");

	const [error, setError] = useState<string | null>(null);

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

	const validate = () => {
		const normalizedEmail = email.trim().toLowerCase();

		const result = createWorkspaceInvitationSchema.safeParse({
			email: normalizedEmail,
			role,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);

			return null;
		}

		return result.data;
	};

	const reset = () => {
		setEmail("");
		setRole("member");
		setError(null);
	};

	const handleEmailKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
		callback: () => void,
	) => {
		if (event.key !== "Enter") return;

		event.preventDefault();

		callback();
	};

	return {
		email,
		role,
		error,

		updateEmail,
		updateRole,

		validate,
		reset,

		handleEmailKeyDown,
		setError,
	};
}
