"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "@/features/dashboard/actions/dashboard";

export type RecentActivity = Extract<
	Awaited<ReturnType<typeof getRecentActivity>>,
	{ success: true }
>["data"];

export type RecentActivityItem = RecentActivity[number];

interface UseRecentActivityProps {
	workspaceSlug: string;
}

export function useRecentActivity({ workspaceSlug }: UseRecentActivityProps) {
	const query = useQuery({
		queryKey: ["dashboard", workspaceSlug, "activity"],
		queryFn: async () => {
			const result = await getRecentActivity(workspaceSlug);

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
