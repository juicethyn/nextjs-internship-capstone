"use client";

import { useUser } from "@clerk/nextjs";
import type { EmailAddressResource } from "@clerk/nextjs/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecuritySettings } from "@/features/account/hooks/use-security-settings";
import {
	type ChangeEmailInput,
	changeEmailSchema,
	type EmailCodeInput,
	emailCodeSchema,
} from "@/lib/validations/user";

export function ChangeEmailDialog() {
	const { user } = useUser();
	const {
		startEmailChange,
		isStartingEmailChange,
		confirmEmailChange,
		isConfirmingEmailChange,
	} = useSecuritySettings();

	const [isOpen, setOpen] = useState(false);
	const [pending, setPending] = useState<EmailAddressResource | null>(null);

	const emailForm = useForm<ChangeEmailInput>({
		resolver: zodResolver(changeEmailSchema),
		mode: "onChange",
		defaultValues: { email: "" },
	});

	const codeForm = useForm<EmailCodeInput>({
		resolver: zodResolver(emailCodeSchema),
		mode: "onChange",
		defaultValues: { code: "" },
	});

	const discardAbandonedAddresses = () => {
		if (!user) return;

		for (const address of user.emailAddresses) {
			const isAbandoned =
				address.id !== user.primaryEmailAddressId &&
				address.verification.status !== "verified";

			if (isAbandoned) {
				void address.destroy().catch(() => undefined);
			}
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (open) {
			discardAbandonedAddresses();
		} else {
			setPending(null);
			emailForm.reset();
			codeForm.reset();
		}

		setOpen(open);
	};

	const onSendCode = async (data: ChangeEmailInput) => {
		const result = await startEmailChange(data.email);

		if (!result.success) {
			emailForm.setError("email", { message: result.message });
			return;
		}

		setPending(result.emailAddress);
	};

	const onVerifyCode = async (data: EmailCodeInput) => {
		if (!pending) return;

		const result = await confirmEmailChange({
			emailAddress: pending,
			code: data.code,
		});

		if (!result.success) {
			codeForm.setError("code", { message: result.message });
			return;
		}

		handleOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" className="w-full sm:w-auto">
					Change email
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{pending ? "Verify your new email" : "Change email"}
					</DialogTitle>

					<DialogDescription>
						{pending
							? `Enter the 6-digit code we sent to ${pending.emailAddress}.`
							: "We'll send a verification code to your new address before switching."}
					</DialogDescription>
				</DialogHeader>

				{pending ? (
					<form
						onSubmit={codeForm.handleSubmit(onVerifyCode)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="email-code">Verification code</Label>

							<Input
								id="email-code"
								inputMode="numeric"
								autoComplete="one-time-code"
								maxLength={6}
								placeholder="000000"
								{...codeForm.register("code")}
							/>

							{codeForm.formState.errors.code && (
								<p className="text-sm text-destructive">
									{codeForm.formState.errors.code.message}
								</p>
							)}
						</div>

						<DialogFooter>
							<Button
								type="submit"
								disabled={
									isConfirmingEmailChange || !codeForm.formState.isValid
								}
								className="w-full sm:w-auto"
							>
								{isConfirmingEmailChange ? "Verifying..." : "Verify and switch"}
							</Button>
						</DialogFooter>
					</form>
				) : (
					<form
						onSubmit={emailForm.handleSubmit(onSendCode)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="new-email">New email</Label>

							<Input
								id="new-email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								{...emailForm.register("email")}
							/>

							{emailForm.formState.errors.email && (
								<p className="text-sm text-destructive">
									{emailForm.formState.errors.email.message}
								</p>
							)}
						</div>

						<DialogFooter>
							<Button
								type="submit"
								disabled={isStartingEmailChange || !emailForm.formState.isValid}
								className="w-full sm:w-auto"
							>
								{isStartingEmailChange ? "Sending..." : "Send code"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
