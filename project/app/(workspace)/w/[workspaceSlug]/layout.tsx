import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getCurrentUserOwnedWorkspaces } from "@/lib/actions/workspaces";
import { getCurrentUser } from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/db/queries/workspaces";
import { requireWorkspaceMember } from "@/lib/permission";

type LayoutProps = {
	children: React.ReactNode;
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function Layout({ children, params }: LayoutProps) {
	const { workspaceSlug } = await params;

	const user = await getCurrentUser();

	const ownedWorkspaces = await getCurrentUserOwnedWorkspaces();

	if (ownedWorkspaces.data.length === 0) {
		redirect("/onboarding");
	}

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	const workspaces = await getUserWorkspaces(user.id);

	// A signed-in user who landed on someone else's workspace is better served
	// by being dropped into one of their own than by a dead-end error page.
	if (!access.success) {
		redirect(
			workspaces.length > 0
				? `/w/${workspaces[0].slug}/dashboard`
				: "/onboarding",
		);
	}

	const currentWorkspace = access.data;

	// getWorkspaceBySlug already loads `members`, so the role costs no extra query.
	const currentUserRole =
		currentWorkspace.members.find((member) => member.userId === user.id)
			?.role ?? "member";

	return (
		<DashboardLayout
			currentWorkspace={currentWorkspace}
			currentUserRole={currentUserRole}
			workspaces={workspaces}
		>
			{children}
		</DashboardLayout>
	);
}
