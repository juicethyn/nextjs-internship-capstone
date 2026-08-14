"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceOverview } from "@/features/dashboard/actions/dashboard";

export type WorkspaceOverview = Extract<
	Awaited<ReturnType<typeof getWorkspaceOverview>>,
	{ success: true }
>["data"];

interface UseWorkspaceOverviewProps {
	workspaceSlug: string;
}

export function useWorkspaceOverview({
	workspaceSlug,
}: UseWorkspaceOverviewProps) {
	const query = useQuery({
		queryKey: ["dashboard", workspaceSlug, "overview"],
		queryFn: async () => {
			const result = await getWorkspaceOverview(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
