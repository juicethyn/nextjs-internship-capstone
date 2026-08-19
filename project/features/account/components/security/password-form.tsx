"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSecuritySettings } from "@/features/account/hooks/use-security-settings";
import {
	changePasswordSchema,
	type PasswordFormInput,
	setPasswordSchema,
} from "@/lib/validations/user";

type PasswordFormProps = {
	mode: "set" | "change";
	onCancel?: () => void;
};

const CURRENT_PASSWORD_PARAMS = ["current_password", "currentPassword"];

export function PasswordForm({ mode, onCancel }: PasswordFormProps) {
	const { changePassword, isSavingPassword } = useSecuritySettings();
	const [isRevealed, setRevealed] = useState(false);

	const form = useForm<PasswordFormInput>({
		resolver: zodResolver(
			mode === "set" ? setPasswordSchema : changePasswordSchema,
		),
		mode: "onChange",
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			signOutOfOtherSessions: true,
		},
	});

	const inputType = isRevealed ? "text" : "password";

	const onSubmit = async (data: PasswordFormInput) => {
		const result = await changePassword({
			mode,
			params: {
				newPassword: data.newPassword,
				signOutOfOtherSessions: data.signOutOfOtherSessions,
				...(mode === "change" ? { currentPassword: data.currentPassword } : {}),
			},
		});

		if (!result.success) {
			if (
				result.paramName &&
				CURRENT_PASSWORD_PARAMS.includes(result.paramName)
			) {
				form.setError("currentPassword", { message: result.message });
			} else if (result.paramName) {
				form.setError("newPassword", { message: result.message });
			}

			return;
		}

		form.reset();
		onCancel?.();
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			{mode === "change" && (
				<div className="space-y-2">
					<Label htmlFor="current-password">Current password</Label>

					<Input
						id="current-password"
						type={inputType}
						autoComplete="current-password"
						{...form.register("currentPassword")}
					/>

					{form.formState.errors.currentPassword && (
						<p className="text-sm text-destructive">
							{form.formState.errors.currentPassword.message}
						</p>
					)}
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="min-w-0 space-y-2">
					<Label htmlFor="new-password">New password</Label>

					<Input
						id="new-password"
						type={inputType}
						autoComplete="new-password"
						{...form.register("newPassword")}
					/>

					{form.formState.errors.newPassword && (
						<p className="text-sm text-destructive">
							{form.formState.errors.newPassword.message}
						</p>
					)}
				</div>

				<div className="min-w-0 space-y-2">
					<Label htmlFor="confirm-password">Confirm new password</Label>

					<Input
						id="confirm-password"
						type={inputType}
						autoComplete="new-password"
						{...form.register("confirmPassword")}
					/>

					{form.formState.errors.confirmPassword && (
						<p className="text-sm text-destructive">
							{form.formState.errors.confirmPassword.message}
						</p>
					)}
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={() => setRevealed((value) => !value)}
				className="-ml-2 text-muted-foreground"
			>
				{isRevealed ? <EyeOff /> : <Eye />}
				{isRevealed ? "Hide passwords" : "Show passwords"}
			</Button>

			<div className="flex items-start justify-between gap-4 rounded-xl border bg-muted p-3">
				<div className="min-w-0 space-y-0.5">
					<Label htmlFor="sign-out-others">Sign out of other devices</Label>

					<p className="text-xs text-muted-foreground">
						End every other active session once your password changes.
					</p>
				</div>

				<Controller
					control={form.control}
					name="signOutOfOtherSessions"
					render={({ field }) => (
						<Switch
							id="sign-out-others"
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
			</div>

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				{onCancel && (
					<Button
						type="button"
						variant="ghost"
						onClick={onCancel}
						disabled={isSavingPassword}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
				)}

				<Button
					type="submit"
					disabled={
						isSavingPassword ||
						!form.formState.isDirty ||
						!form.formState.isValid
					}
					className="w-full sm:w-auto"
				>
					{isSavingPassword
						? "Saving..."
						: mode === "set"
							? "Set password"
							: "Update password"}
				</Button>
			</div>
		</form>
	);
}
