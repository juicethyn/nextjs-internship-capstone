"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "@/features/dashboard/actions/dashboard";

export type MyTasksData = Extract<
	Awaited<ReturnType<typeof getMyTasks>>,
	{ success: true }
>["data"];

export type MyTaskItemData = MyTasksData["overdue"][number];

interface UseMyTasksProps {
	workspaceSlug: string;
}

export function useMyTasks({ workspaceSlug }: UseMyTasksProps) {
	const query = useQuery({
		queryKey: ["dashboard", workspaceSlug, "my-tasks"],
		queryFn: async () => {
			const result = await getMyTasks(workspaceSlug);

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
