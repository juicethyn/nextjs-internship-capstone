"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskLabelsByProjectAction } from "@/lib/actions/taskLabels";

interface UseTaskLabelsProps {
	workspaceSlug: string;
	projectSlug: string;
	enabled?: boolean;
}

export function useTaskLabels({
	workspaceSlug,
	projectSlug,
	enabled = true,
}: UseTaskLabelsProps) {
	const query = useQuery({
		queryKey: ["task-labels", workspaceSlug, projectSlug],
		queryFn: () => getTaskLabelsByProjectAction(workspaceSlug, projectSlug),
		enabled,
	});

	return {
		taskLabels: query.data ?? [],
		isLoading: query.isLoading,
	};
}
