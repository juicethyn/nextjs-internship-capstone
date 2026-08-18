"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectProgress } from "@/features/analytics/actions/analytics";

export type ProjectProgress = Extract<
	Awaited<ReturnType<typeof getProjectProgress>>,
	{ success: true }
>["data"];

export type ProgressRow = ProjectProgress["rows"][number];

interface UseProjectProgressProps {
	workspaceSlug: string;
	projectId: string | null;
}

export function useProjectProgress({
	workspaceSlug,
	projectId,
}: UseProjectProgressProps) {
	const query = useQuery({
		queryKey: ["analytics", workspaceSlug, "project-progress", projectId],
		queryFn: async () => {
			const result = await getProjectProgress(workspaceSlug, projectId);

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
