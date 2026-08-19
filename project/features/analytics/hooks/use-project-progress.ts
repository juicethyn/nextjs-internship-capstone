"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectProgress } from "@/features/analytics/actions/analytics";
import type { AnalyticsFilters } from "@/features/analytics/types";

export type ProjectProgress = Extract<
	Awaited<ReturnType<typeof getProjectProgress>>,
	{ success: true }
>["data"];

export type ProgressRow = ProjectProgress["rows"][number];

interface UseProjectProgressProps {
	workspaceSlug: string;
	filters: AnalyticsFilters;
}

export function useProjectProgress({
	workspaceSlug,
	filters,
}: UseProjectProgressProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "project-progress", filters],
		queryFn: async () => {
			const result = await getProjectProgress(workspaceSlug, filters);

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
