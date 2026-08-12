import { MembersClient } from "@/components/members/members-client";
import { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";

type MembersPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function MembersPage({ params }: MembersPageProps) {
	const { workspaceSlug } = await params;

	const {
		members,
		pendingInvitations,
		currentUserId,
		viewerRole,
		workspaceName,
	} = await getWorkspaceMembersWithStatsBySlug(workspaceSlug);

	return (
		<MembersClient
			members={members}
			pendingInvitations={pendingInvitations}
			currentUserId={currentUserId}
			viewerCanManage={viewerRole === "owner" || viewerRole === "admin"}
			workspaceSlug={workspaceSlug}
			workspaceName={workspaceName}
		/>
	);
}
