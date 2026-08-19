"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAccountSettings } from "@/features/account/hooks/use-account-settings";
import { OCCUPATIONS } from "@/lib/db/constants";
import type { Occupation } from "@/lib/db/schema";
import {
	type ProfileSettingsInput,
	profileSettingsSchema,
} from "@/lib/validations/user";

type ProfileFormProps = {
	firstName: string;
	lastName: string;
	email: string;
	occupation: Occupation | null;
};

export function ProfileForm({
	firstName,
	lastName,
	email,
	occupation,
}: ProfileFormProps) {
	const { updateProfile, isUpdating } = useAccountSettings();

	const form = useForm<ProfileSettingsInput>({
		resolver: zodResolver(profileSettingsSchema),
		mode: "onChange",
		defaultValues: {
			firstName,
			lastName,
			occupation: occupation ?? "other",
		},
	});

	const onSubmit = async (data: ProfileSettingsInput) => {
		const result = await updateProfile(data);

		if (result.success) {
			form.reset(data);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="min-w-0 space-y-2">
					<Label htmlFor="first-name">First name</Label>

					<Input
						id="first-name"
						{...form.register("firstName")}
						maxLength={50}
					/>

					{form.formState.errors.firstName && (
						<p className="text-sm text-destructive">
							{form.formState.errors.firstName.message}
						</p>
					)}
				</div>

				<div className="min-w-0 space-y-2">
					<Label htmlFor="last-name">Last name</Label>

					<Input id="last-name" {...form.register("lastName")} maxLength={50} />

					{form.formState.errors.lastName && (
						<p className="text-sm text-destructive">
							{form.formState.errors.lastName.message}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="occupation">Occupation</Label>

				<Controller
					control={form.control}
					name="occupation"
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger id="occupation" className="w-full">
								<SelectValue placeholder="Select your role" />
							</SelectTrigger>

							<SelectContent>
								{OCCUPATIONS.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>

				<Input id="email" value={email} readOnly disabled />

				<p className="text-xs text-muted-foreground">
					Your email is managed by your sign-in provider.
				</p>
			</div>

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={
						isUpdating || !form.formState.isDirty || !form.formState.isValid
					}
					className="w-full sm:w-auto"
				>
					{isUpdating ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
