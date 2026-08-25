import {
	getCurrentUserOwnedWorkspaces,
	getCurrentWorkspaceAction,
} from "@/features/workspace/actions/workspaces";
import { SyncRedirect } from "@/features/workspace/components/sync-redirect";
import { waitForCurrentUser } from "@/lib/auth";

// Act as a redirect page to the user's current workspace dashboard if they have one, otherwise redirect to onboarding
async function resolveDestination() {
	const user = await waitForCurrentUser();

	if (!user) {
		return "/sign-in";
	}

	const ownedWorkspaces = await getCurrentUserOwnedWorkspaces();

	if (ownedWorkspaces.data.length === 0) {
		return "/onboarding";
	}

	const workspace = await getCurrentWorkspaceAction();

	if (workspace?.data?.slug) {
		return `/w/${workspace.data.slug}/dashboard`;
	}

	return `/w/${ownedWorkspaces.data[0].slug}/dashboard`;
}

export default async function SyncPage() {
	const destination = await resolveDestination();

	return <SyncRedirect to={destination} />;
}
