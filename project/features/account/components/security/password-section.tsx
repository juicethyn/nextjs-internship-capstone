"use client";

import { useUser } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordForm } from "@/features/account/components/security/password-form";

export function PasswordSection() {
	const { user, isLoaded } = useUser();
	const [isSettingPassword, setSettingPassword] = useState(false);

	const hasPassword = user?.passwordEnabled ?? false;
	const provider = user?.externalAccounts[0]?.providerTitle();

	return (
		<div className="space-y-3 rounded-lg border p-4">
			<div>
				<h3 className="text-sm font-semibold">Password</h3>

				<p className="mt-1 text-sm text-muted-foreground">
					{hasPassword
						? "Change the password you use to sign in."
						: `Your account is secured by ${provider ?? "your sign-in provider"}.`}
				</p>
			</div>

			{!isLoaded || !user ? (
				<Skeleton className="h-32 w-full rounded-xl" />
			) : hasPassword ? (
				<PasswordForm mode="change" />
			) : isSettingPassword ? (
				<PasswordForm mode="set" onCancel={() => setSettingPassword(false)} />
			) : (
				<div className="flex flex-col gap-3 rounded-xl border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

						<p className="text-sm text-muted-foreground">
							You don't have a password yet. Add one so you can sign in without{" "}
							{provider ?? "your provider"}.
						</p>
					</div>

					<Button
						type="button"
						variant="outline"
						onClick={() => setSettingPassword(true)}
						className="w-full shrink-0 sm:w-auto"
					>
						Set a password
					</Button>
				</div>
			)}
		</div>
	);
}
