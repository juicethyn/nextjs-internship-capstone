"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalyticsProjectOptions } from "@/features/analytics/actions/analytics";

export type AnalyticsProjectOption = Extract<
	Awaited<ReturnType<typeof getAnalyticsProjectOptions>>,
	{ success: true }
>["data"][number];

interface UseAnalyticsProjectOptionsProps {
	workspaceSlug: string;
	includeArchived: boolean;
}

export function useAnalyticsProjectOptions({
	workspaceSlug,
	includeArchived,
}: UseAnalyticsProjectOptionsProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "project-options", includeArchived],
		queryFn: async () => {
			const result = await getAnalyticsProjectOptions(
				workspaceSlug,
				includeArchived,
			);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchOnMount: "always",
	});

	return {
		projects: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		isSuccess: query.isSuccess,
	};
}
