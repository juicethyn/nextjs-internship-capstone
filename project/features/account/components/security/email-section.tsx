"use client";

import { useUser } from "@clerk/nextjs";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeEmailDialog } from "@/features/account/components/security/change-email-dialog";

export function EmailSection() {
	const { user, isLoaded } = useUser();

	const primaryEmail = user?.primaryEmailAddress?.emailAddress;

	return (
		<div className="space-y-3 rounded-lg border p-4">
			<div>
				<h3 className="text-sm font-semibold">Email address</h3>

				<p className="mt-1 text-sm text-muted-foreground">
					Used to sign in and to receive notifications from Fora.
				</p>
			</div>

			{!isLoaded || !user ? (
				<Skeleton className="h-14 w-full rounded-xl" />
			) : (
				<div className="flex flex-col gap-3 rounded-xl border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-3">
						<Mail className="size-4 shrink-0 text-muted-foreground" />

						<p className="truncate text-sm font-medium">
							{primaryEmail ?? "No email on file"}
						</p>

						<Badge variant="muted" className="shrink-0">
							Primary
						</Badge>
					</div>

					<ChangeEmailDialog />
				</div>
			)}
		</div>
	);
}
