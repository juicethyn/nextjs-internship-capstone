"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsOverview } from "@/features/analytics/actions/analytics";

export type AnalyticsOverview = Extract<
	Awaited<ReturnType<typeof getAnalyticsOverview>>,
	{ success: true }
>["data"];

interface UseAnalyticsOverviewProps {
	workspaceSlug: string;
}

export function useAnalyticsOverview({
	workspaceSlug,
}: UseAnalyticsOverviewProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "overview"],
		queryFn: async () => {
			const result = await getAnalyticsOverview(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchOnMount: "always",
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
