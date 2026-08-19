"use client";

import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProviderIcon } from "@/features/account/components/security/provider-icon";

export function ConnectedAccountsSection() {
	const { user, isLoaded } = useUser();

	return (
		<div className="space-y-3 rounded-lg border p-4">
			<div>
				<h3 className="text-sm font-semibold">Connected accounts</h3>

				<p className="mt-1 text-sm text-muted-foreground">
					Services you use to sign in to Fora.
				</p>
			</div>

			{!isLoaded || !user ? (
				<Skeleton className="h-14 w-full rounded-xl" />
			) : user.externalAccounts.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No connected accounts. You sign in with your email and password.
				</p>
			) : (
				<div className="space-y-2">
					{user.externalAccounts.map((account) => (
						<div
							key={account.id}
							className="flex items-center gap-3 rounded-xl border bg-muted p-3"
						>
							<ProviderIcon provider={account.provider} />

							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">
									{account.providerTitle()}
								</p>

								<p className="truncate text-xs text-muted-foreground">
									{account.accountIdentifier()}
								</p>
							</div>

							<Badge variant="muted" className="shrink-0">
								<Check />
								Connected
							</Badge>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
