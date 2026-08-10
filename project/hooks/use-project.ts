"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/lib/actions/projects";
import type { ProjectDetail } from "@/types/projects";

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

			return result.project ?? initialProject;
		},
		initialData: initialProject,
	});

	return {
		project: query.data,
		isLoading: query.isLoading,
	};
}
