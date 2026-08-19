"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeamContributions } from "@/features/analytics/actions/analytics";
import type { AnalyticsFilters } from "@/features/analytics/types";

export type TeamContributions = Extract<
	Awaited<ReturnType<typeof getTeamContributions>>,
	{ success: true }
>["data"];

export type ContributionRow = TeamContributions["rows"][number];

interface UseTeamContributionsProps {
	workspaceSlug: string;
	filters: AnalyticsFilters;
}

export function useTeamContributions({
	workspaceSlug,
	filters,
}: UseTeamContributionsProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "contributions", filters],
		queryFn: async () => {
			const result = await getTeamContributions(workspaceSlug, filters);

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
