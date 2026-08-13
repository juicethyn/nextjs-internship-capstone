import { Mail, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { getWorkspaceInvitationByToken } from "@/lib/db/queries/workspaceInvitations";
import { AcceptInvitationButton } from "./accept-invitation-button";

type InvitationCardProps = {
	invitation: NonNullable<
		Awaited<ReturnType<typeof getWorkspaceInvitationByToken>>
	>;

	token: string;
};

export function InvitationCard({ invitation, token }: InvitationCardProps) {
	return (
		<Card className="w-full max-w-md">
			<CardContent className="space-y-6 p-6">
				<div className="space-y-2 text-center">
					<div
						className="
						mx-auto
						flex
						size-12
						items-center
						justify-center
						rounded-full
						bg-primary/10
					"
					>
						<Users className="size-6 text-primary" />
					</div>

					<h1 className="text-2xl font-bold">You're invited!</h1>

					<p className="text-sm text-muted-foreground">
						You have been invited to join
					</p>

					<p className="font-semibold">{invitation.workspace.name}</p>
				</div>

				<div
					className="
					rounded-lg
					border
					bg-muted/30
					p-4
					space-y-3
				"
				>
					<div className="flex items-center gap-3">
						<Mail className="size-4 text-muted-foreground" />

						<div>
							<p className="text-xs text-muted-foreground">Invited Email</p>

							<p className="text-sm font-medium">{invitation.email}</p>
						</div>
					</div>

					<div>
						<p className="text-xs text-muted-foreground">Role</p>

						<p
							className="
							text-sm
							font-medium
							capitalize
						"
						>
							{invitation.role}
						</p>
					</div>
				</div>

				<AcceptInvitationButton token={token} />
			</CardContent>
		</Card>
	);
}
