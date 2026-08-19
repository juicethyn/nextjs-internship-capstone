"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsOverview } from "@/features/analytics/actions/analytics";
import type { AnalyticsFilters } from "@/features/analytics/types";

export type AnalyticsOverview = Extract<
	Awaited<ReturnType<typeof getAnalyticsOverview>>,
	{ success: true }
>["data"];

interface UseAnalyticsOverviewProps {
	workspaceSlug: string;
	filters: AnalyticsFilters;
}

export function useAnalyticsOverview({
	workspaceSlug,
	filters,
}: UseAnalyticsOverviewProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "overview", filters],
		queryFn: async () => {
			const result = await getAnalyticsOverview(workspaceSlug, filters);

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
