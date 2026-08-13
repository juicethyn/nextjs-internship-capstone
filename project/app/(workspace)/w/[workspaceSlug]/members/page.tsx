import { redirect } from "next/navigation";
import { MembersClient } from "@/components/members/members-client";
import { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";

type MembersPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function MembersPage({ params }: MembersPageProps) {
	const { workspaceSlug } = await params;

	const result = await getWorkspaceMembersWithStatsBySlug(workspaceSlug);

	if (!result.success) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	return (
		<MembersClient workspaceSlug={workspaceSlug} initialData={result.data} />
	);
}
