"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMembersBySlug } from "@/lib/actions/workspaceMembers";

export function useWorkspaceMembers(workspaceSlug: string, enabled = true) {
	const query = useQuery({
		queryKey: ["workspace-members", workspaceSlug],
		queryFn: async () => {
			const result = await getWorkspaceMembersBySlug(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		enabled,
	});

	return {
		members: query.data ?? [],
		isLoading: query.isLoading,
	};
}
