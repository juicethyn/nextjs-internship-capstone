import { TriangleAlert } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { getDashboardHeaderData } from "@/features/dashboard/actions/dashboard";
import { DashboardClient } from "@/features/dashboard/components/dashboard-client";

type DashboardPageProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
	const { workspaceSlug } = await params;

	const result = await getDashboardHeaderData(workspaceSlug);

	// Every other route redirects here when it fails, so this one reports instead
	// of redirecting — sending /dashboard to /dashboard is an infinite loop.
	if (!result.success) {
		return (
			<ErrorState
				icon={TriangleAlert}
				title="Dashboard unavailable"
				description={result.message}
				className="min-h-[60vh]"
			/>
		);
	}

	return (
		<DashboardClient workspaceSlug={workspaceSlug} initialData={result.data} />
	);
}
