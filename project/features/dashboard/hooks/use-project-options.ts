"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectBySlug } from "@/features/projects/actions/projects";

interface UseProjectOptionsProps {
	workspaceSlug: string;
	projectSlug: string | null;
}

export function useProjectOptions({
	workspaceSlug,
	projectSlug,
}: UseProjectOptionsProps) {
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

	const project = query.data ?? null;

	return {
		todoLists: (project?.lists ?? []).filter((list) => list.type === "todo"),
		members: project?.members ?? [],
		isLoading: query.isLoading,
	};
}
