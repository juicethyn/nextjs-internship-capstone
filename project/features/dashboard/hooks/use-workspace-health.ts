"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceHealth } from "@/features/dashboard/actions/dashboard";

export type WorkspaceHealthData = Extract<
	Awaited<ReturnType<typeof getWorkspaceHealth>>,
	{ success: true }
>["data"];

interface UseWorkspaceHealthProps {
	workspaceSlug: string;
}

export function useWorkspaceHealth({ workspaceSlug }: UseWorkspaceHealthProps) {
	const query = useQuery({
		queryKey: ["dashboard", workspaceSlug, "health"],
		queryFn: async () => {
			const result = await getWorkspaceHealth(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchOnMount: "always",
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
