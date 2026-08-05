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

	console.log("TOKEN:", token);

	const result = await getWorkspaceInvitationByTokenAction(token);

	if (!result.success) {
		return <InvitationError message={result.error} />;
	}

	return <InvitationCard invitation={result.data} token={token} />;
}
