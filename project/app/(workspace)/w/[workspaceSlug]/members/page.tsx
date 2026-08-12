import { MembersClient } from "@/components/members/members-client";
import { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";

type MembersPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function MembersPage({ params }: MembersPageProps) {
	const { workspaceSlug } = await params;

	const { members, currentUserId } =
		await getWorkspaceMembersWithStatsBySlug(workspaceSlug);

	const viewerRole = members.find(
		(member) => member.userId === currentUserId,
	)?.role;

	return (
		<MembersClient
			members={members}
			currentUserId={currentUserId}
			viewerCanManage={viewerRole === "owner" || viewerRole === "admin"}
		/>
	);
}
