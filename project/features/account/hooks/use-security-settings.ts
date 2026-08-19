"use client";

import { useReverification, useUser } from "@clerk/nextjs";
import type {
	EmailAddressResource,
	UpdateUserPasswordParams,
} from "@clerk/nextjs/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncEmailAction } from "@/features/account/actions/account";
import { toClerkError } from "@/lib/clerk-error";

export type SecurityResult =
	| { success: true }
	| { success: false; message: string; paramName?: string };

type StartEmailResult =
	| { success: true; emailAddress: EmailAddressResource }
	| { success: false; message: string; paramName?: string };

type PasswordVariables = {
	mode: "set" | "change";
	params: UpdateUserPasswordParams;
};

type ConfirmEmailVariables = {
	emailAddress: EmailAddressResource;
	code: string;
};

const MISSING_USER = "Your session expired. Refresh the page and try again.";

export function useSecuritySettings() {
	const router = useRouter();
	const { user } = useUser();

	const updatePassword = useReverification((params: UpdateUserPasswordParams) =>
		user?.updatePassword(params),
	);

	const createEmailAddress = useReverification((email: string) =>
		user?.createEmailAddress({ email }),
	);

	const setPrimaryEmail = useReverification((primaryEmailAddressId: string) =>
		user?.update({ primaryEmailAddressId }),
	);

	const passwordMutation = useMutation({
		mutationFn: async ({
			params,
		}: PasswordVariables): Promise<SecurityResult> => {
			if (!user) {
				return { success: false, message: MISSING_USER };
			}

			try {
				await updatePassword(params);
				return { success: true };
			} catch (error) {
				return {
					success: false,
					...toClerkError(error, "Couldn't update your password."),
				};
			}
		},
		onSuccess: (result, variables) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(
				variables.mode === "set" ? "Password set." : "Password updated.",
			);
		},
		onError: () => toast.error("Couldn't update your password."),
	});

	const startEmailMutation = useMutation({
		mutationFn: async (email: string): Promise<StartEmailResult> => {
			if (!user) {
				return { success: false, message: MISSING_USER };
			}

			try {
				const created = await createEmailAddress(email);

				if (!created) {
					return { success: false, message: "Couldn't add that email." };
				}

				await created.prepareVerification({ strategy: "email_code" });

				return { success: true, emailAddress: created };
			} catch (error) {
				return {
					success: false,
					...toClerkError(error, "Couldn't send a verification code."),
				};
			}
		},
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success("Verification code sent.");
		},
		onError: () => toast.error("Couldn't send a verification code."),
	});

	const confirmEmailMutation = useMutation({
		mutationFn: async ({
			emailAddress,
			code,
		}: ConfirmEmailVariables): Promise<SecurityResult> => {
			if (!user) {
				return { success: false, message: MISSING_USER };
			}

			const previousPrimaryId = user.primaryEmailAddressId;

			try {
				const verified = await emailAddress.attemptVerification({ code });

				if (verified.verification.status !== "verified") {
					return {
						success: false,
						message: "That code isn't valid. Try again.",
						paramName: "code",
					};
				}

				await setPrimaryEmail(verified.id);
			} catch (error) {
				return {
					success: false,
					...toClerkError(error, "Couldn't verify that code."),
				};
			}

			const previous = user.emailAddresses.find(
				(item) => item.id === previousPrimaryId,
			);

			if (previous && previous.linkedTo.length === 0) {
				await previous.destroy().catch(() => undefined);
			}

			await user.reload();

			const synced = await syncEmailAction();

			if (!synced.success) {
				return { success: false, message: synced.message };
			}

			return { success: true };
		},
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			router.refresh();
			toast.success("Email updated.");
		},
		onError: () => toast.error("Couldn't update your email."),
	});

	return {
		changePassword: passwordMutation.mutateAsync,
		isSavingPassword: passwordMutation.isPending,
		startEmailChange: startEmailMutation.mutateAsync,
		isStartingEmailChange: startEmailMutation.isPending,
		confirmEmailChange: confirmEmailMutation.mutateAsync,
		isConfirmingEmailChange: confirmEmailMutation.isPending,
	};
}
