// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.2 - Create project listing and dashboard interface

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	createProjectAction,
	getProjectsByWorkspaceBySlug,
} from "@/features/projects/actions/projects";
import type { ProjectWithRelations } from "@/features/projects/types";
import type { CreateProjectInput } from "@/lib/validations/project";

interface UseProjectsProps {
	workspaceSlug: string;
	initialProjects?: ProjectWithRelations[];
}

export function useProjects({
	workspaceSlug,
	initialProjects,
}: UseProjectsProps) {
	const router = useRouter();

	const query = useQuery({
		queryKey: ["projects", workspaceSlug],
		queryFn: async () => {
			const result = await getProjectsByWorkspaceBySlug(workspaceSlug);

			// Throwing keeps the query in an error state instead of silently
			// replacing a permission failure with an empty grid.
			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		initialData: initialProjects,
	});

	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: (data: CreateProjectInput) =>
			createProjectAction(workspaceSlug, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(result.message);

			queryClient.invalidateQueries({
				queryKey: ["projects", workspaceSlug],
			});

			queryClient.invalidateQueries({
				queryKey: ["dashboard", workspaceSlug],
			});

			router.push(`/w/${workspaceSlug}/projects/${result.project?.slug}`);
		},

		onError: () => {
			toast.error("Failed to create project.");
		},
	});

	return {
		projects: query.data ?? [],
		isLoading: query.isLoading,

		createProject: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
	};
}
