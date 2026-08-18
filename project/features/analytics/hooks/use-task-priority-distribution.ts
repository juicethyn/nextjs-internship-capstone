"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskPriorityDistribution } from "@/features/analytics/actions/analytics";

export type TaskPriorityDistribution = Extract<
	Awaited<ReturnType<typeof getTaskPriorityDistribution>>,
	{ success: true }
>["data"];

interface UseTaskPriorityDistributionProps {
	workspaceSlug: string;
	projectId: string | null;
}

export function useTaskPriorityDistribution({
	workspaceSlug,
	projectId,
}: UseTaskPriorityDistributionProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "priority", projectId],
		queryFn: async () => {
			const result = await getTaskPriorityDistribution(
				workspaceSlug,
				projectId,
			);

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
