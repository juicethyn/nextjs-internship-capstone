import { InvitationCard } from "@/components/invitations/invitation-card";
import { InvitationError } from "@/components/invitations/invitation-error";
import { getWorkspaceInvitationByTokenAction } from "@/lib/actions/workspaceInvitations";

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
				<InvitationError message={result.error} />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<InvitationCard invitation={result.data} token={token} />
		</div>
	);
}
