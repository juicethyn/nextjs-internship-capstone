"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskActivityAction } from "@/features/projects/kanban/actions/task-activity";

type ActivitySuccess = Extract<
	Awaited<ReturnType<typeof getTaskActivityAction>>,
	{ data: unknown }
>;

export type TaskActivityItem = ActivitySuccess["data"][number];

interface UseTaskActivityProps {
	workspaceSlug: string;
	projectSlug: string;
	taskId: string;
	enabled?: boolean;
}

export function useTaskActivity({
	workspaceSlug,
	projectSlug,
	taskId,
	enabled = true,
}: UseTaskActivityProps) {
	const query = useQuery({
		queryKey: ["task-activity", workspaceSlug, projectSlug, taskId],
		queryFn: async () => {
			const result = await getTaskActivityAction(
				workspaceSlug,
				projectSlug,
				taskId,
			);

			return result.success ? result.data : [];
		},
		enabled,
	});

	return {
		activity: query.data ?? [],
		isLoading: query.isLoading,
	};
}
