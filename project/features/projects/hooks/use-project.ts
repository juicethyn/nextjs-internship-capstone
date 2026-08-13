"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/features/projects/actions/projects";
import type { ProjectDetail } from "@/features/projects/types";

interface UseProjectProps {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
}

export function useProject({
	workspaceSlug,
	projectSlug,
	initialProject,
}: UseProjectProps) {
	const query = useQuery({
		queryKey: ["project", workspaceSlug, projectSlug],
		queryFn: async () => {
			const result = await getProjectBySlug(workspaceSlug, projectSlug);

			if (!result.success) throw new Error(result.message);

			return result.data.project;
		},
		initialData: initialProject,
	});

	return {
		project: query.data,
		isLoading: query.isLoading,
	};
}
