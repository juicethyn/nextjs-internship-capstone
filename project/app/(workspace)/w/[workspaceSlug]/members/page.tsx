import { MembersClient } from "@/components/members/members-client";
import { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";

type MembersPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function MembersPage({ params }: MembersPageProps) {
	const { workspaceSlug } = await params;

	const initialData = await getWorkspaceMembersWithStatsBySlug(workspaceSlug);

	return (
		<MembersClient workspaceSlug={workspaceSlug} initialData={initialData} />
	);
}
