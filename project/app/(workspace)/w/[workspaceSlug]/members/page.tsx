import { redirect } from "next/navigation";
import { getWorkspaceMembersWithStatsBySlug } from "@/features/members/actions/workspaceMembers";
import { MembersClient } from "@/features/members/components/members-client";

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
