import { redirect } from "next/navigation";
import { getCurrentWorkspaceAction } from "@/lib/actions/workspaces";
import { waitForCurrentUser } from "@/lib/auth";

// Act as a redirect page to the user's current workspace dashboard if they have one, otherwise redirect to onboarding
export default async function SyncPage() {
	const user = await waitForCurrentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const workspace = await getCurrentWorkspaceAction();

	if (workspace?.data?.slug) {
		redirect(`/w/${workspace.data.slug}/dashboard`);
	}

	redirect("/onboarding");
}
