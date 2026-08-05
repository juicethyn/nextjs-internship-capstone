import { redirect } from "next/navigation";
import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import { getCurrentUserOwnedWorkspaces } from "@/lib/actions/workspaces";

export default async function OnboardingPage() {
	const ownedWorkspaces = await getCurrentUserOwnedWorkspaces();

	if (ownedWorkspaces.data.length > 0) {
		redirect(`/w/${ownedWorkspaces.data[0].slug}/dashboard`);
	}

	return <OnboardingContainer mode="onboarding" />;
}
