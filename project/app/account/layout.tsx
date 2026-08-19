import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { AccountNav } from "@/features/account/components/account-nav";
import { getCurrentUser } from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/db/queries/workspaces";

export default async function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();

	const workspaces = await getUserWorkspaces(user.id);

	const lastWorkspace =
		workspaces.find((workspace) => workspace.id === user.lastWorkspaceId) ??
		workspaces[0];

	const backHref = lastWorkspace
		? `/w/${lastWorkspace.slug}/dashboard`
		: "/onboarding";

	return (
		<div className="h-dvh overflow-y-auto">
			<div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
				<Link
					href={backHref}
					className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to workspace
				</Link>

				<div className="flex flex-col gap-6 md:flex-row md:gap-10">
					<aside className="md:w-52 md:shrink-0">
						<AccountNav />
					</aside>

					<main className="min-w-0 flex-1">{children}</main>
				</div>
			</div>
		</div>
	);
}
