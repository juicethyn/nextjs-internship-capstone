"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";

export type WorkspaceMembersStats = Awaited<
	ReturnType<typeof getWorkspaceMembersWithStatsBySlug>
>;

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
		queryFn: () => getWorkspaceMembersWithStatsBySlug(workspaceSlug),
		initialData,
	});

	return {
		data: query.data,
		isFetching: query.isFetching,
	};
}
