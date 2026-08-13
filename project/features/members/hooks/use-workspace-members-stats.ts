"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembersWithStatsBySlug } from "@/features/members/actions/workspaceMembers";

export type WorkspaceMembersStats = Extract<
	Awaited<ReturnType<typeof getWorkspaceMembersWithStatsBySlug>>,
	{ success: true }
>["data"];

interface UseWorkspaceMembersStatsProps {
	workspaceSlug: string;
	initialData: WorkspaceMembersStats;
}

export function useWorkspaceMembersStats({
	workspaceSlug,
	initialData,
}: UseWorkspaceMembersStatsProps) {
	const query = useQuery({
		queryKey: ["workspace-members", workspaceSlug, "stats"],
		queryFn: async () => {
			const result = await getWorkspaceMembersWithStatsBySlug(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		initialData,
	});

	return {
		data: query.data,
		isFetching: query.isFetching,
	};
}
