import { redirect } from "next/navigation";
import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import { getCurrentWorkspaceAction } from "@/lib/actions/workspaces";

export default async function OnboardingPage() {
	const workspace = await getCurrentWorkspaceAction();

	if (workspace.data?.setupCompleted) {
		redirect(`/w/${workspace.data.slug}/dashboard`);
	}

	return <OnboardingContainer />;
}
