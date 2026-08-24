"use client";

import { StagedInviteRow } from "@/features/members/components/invitations/staged-invite-row";
import { useWorkspaceSetupStore } from "@/features/workspace/setup/store";

type InviteMembersListsProps = {
	disabled?: boolean;
};

export function InviteMembersLists({
	disabled = false,
}: InviteMembersListsProps) {
	const { invites, removeInvite } = useWorkspaceSetupStore();

	return (
		<section className="min-w-0 space-y-1">
			<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Invited members ({invites.length})
			</h3>

			{invites.length === 0 ? (
				<p className="rounded-lg p-6 text-center text-sm text-muted-foreground">
					No one added yet. Enter an email above and press Add.
				</p>
			) : (
				<ul className="min-w-0 divide-y">
					{invites.map((invite) => (
						<li key={invite.email} className="min-w-0">
							<StagedInviteRow
								invite={{
									email: invite.email,
									role: invite.role === "owner" ? "member" : invite.role,
									user: null,
								}}
								onRemove={() => removeInvite(invite.email)}
								disabled={disabled}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
