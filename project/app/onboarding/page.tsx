import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentUserOwnedWorkspaces } from "@/lib/actions/workspaces";

export default async function OnboardingPage() {
	const ownedWorkspaces = await getCurrentUserOwnedWorkspaces();

	if (ownedWorkspaces.data.length > 0) {
		redirect(`/w/${ownedWorkspaces.data[0].slug}/dashboard`);
	}

	return <OnboardingFlow />;
}
