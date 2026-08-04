import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getCurrentUserOwnedWorkspaces } from "@/lib/actions/workspaces";
import { getCurrentUser } from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/db/queries/workspaces";
import { requireWorkspaceMember } from "@/lib/permission";

type Props = {
	children: React.ReactNode;
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function Layout({ children, params }: Props) {
	const { workspaceSlug } = await params;

	const user = await getCurrentUser();

	const ownedWorkspaces = await getCurrentUserOwnedWorkspaces();

	if (ownedWorkspaces.data.length === 0) {
		redirect("/onboarding");
	}

	// Checks if the user is a member of the workspace, if not, redirects to their own workspace or onboarding
	const currentWorkspace = await requireWorkspaceMember(workspaceSlug, user.id);
	const workspaces = await getUserWorkspaces(user.id);

	return (
		<DashboardLayout
			currentWorkspace={currentWorkspace}
			workspaces={workspaces}
		>
			{children}
		</DashboardLayout>
	);
}
