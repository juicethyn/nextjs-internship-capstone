"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskPriorityDistribution } from "@/features/analytics/actions/analytics";
import type { AnalyticsFilters } from "@/features/analytics/types";

export type TaskPriorityDistribution = Extract<
	Awaited<ReturnType<typeof getTaskPriorityDistribution>>,
	{ success: true }
>["data"];

interface UseTaskPriorityDistributionProps {
	workspaceSlug: string;
	filters: AnalyticsFilters;
}

export function useTaskPriorityDistribution({
	workspaceSlug,
	filters,
}: UseTaskPriorityDistributionProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "priority", filters],
		queryFn: async () => {
			const result = await getTaskPriorityDistribution(workspaceSlug, filters);

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
