"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/features/projects/actions/projects";

interface UseProjectDetailProps {
	workspaceSlug: string;
	projectSlug: string | null;
}

export function useProjectDetail({
	workspaceSlug,
	projectSlug,
}: UseProjectDetailProps) {
	const query = useQuery({
		queryKey: ["project", workspaceSlug, projectSlug],
		queryFn: async () => {
			if (!projectSlug) return null;

			const result = await getProjectBySlug(workspaceSlug, projectSlug);

			if (!result.success) throw new Error(result.message);

			return result.data.project;
		},
		enabled: Boolean(projectSlug),
	});

	return {
		project: query.data ?? null,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
