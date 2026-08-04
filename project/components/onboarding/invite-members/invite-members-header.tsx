import { UserPlus } from "lucide-react";

export function InviteMembersHeader() {
	return (
		<div>
			<div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
				<UserPlus className="size-6 text-primary" />
			</div>

			<h2 className="text-3xl font-bold tracking-tight">Invite your team</h2>

			<p className="mt-2 text-sm text-muted-foreground">
				Add teammates who will collaborate with you. You can skip this step and
				invite them later.
			</p>
		</div>
	);
}
