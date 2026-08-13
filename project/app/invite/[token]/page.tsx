import { getWorkspaceInvitationByTokenAction } from "@/features/members/actions/workspaceInvitations";
import { InvitationCard } from "@/features/members/components/invitations/invitation-card";
import { InvitationError } from "@/features/members/components/invitations/invitation-error";

export default async function InvitationPage({
	params,
}: {
	params: Promise<{
		token: string;
	}>;
}) {
	const { token } = await params;

	const result = await getWorkspaceInvitationByTokenAction(token);

	if (!result.success) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<InvitationError message={result.message} />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<InvitationCard invitation={result.data} token={token} />
		</div>
	);
}
