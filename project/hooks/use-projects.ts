// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.2 - Create project listing and dashboard interface

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	createProjectAction,
	getProjectsByWorkspaceBySlug,
} from "@/lib/actions/projects";
import type { CreateProjectInput } from "@/lib/validations/project";
import type { ProjectWithRelations } from "@/types/projects";

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
			const response = await getProjectsByWorkspaceBySlug(workspaceSlug);
			return response.projects ?? [];
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

/*
TODO: Implementation Notes for Interns:

Custom hook for project data management:
- Fetch projects list
- Create new project
- Update project
- Delete project
- Search/filter projects
- Pagination

Features:
- React Query/SWR for caching
- Optimistic updates
- Error handling
- Loading states
- Infinite scrolling (optional)

Example structure:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  const queryClient = useQueryClient()

  const {
	data: projects,
	isLoading,
	error
  } = useQuery({
	queryKey: ['projects'],
	queryFn: () => queries.projects.getAll()
  })

  const createProject = useMutation({
	mutationFn: queries.projects.create,
	onSuccess: () => {
	  queryClient.invalidateQueries({ queryKey: ['projects'] })
	}
  })

  return {
	projects,
	isLoading,
	error,
	createProject: createProject.mutate,
	isCreating: createProject.isPending
  }
}

Dependencies to install:
- @tanstack/react-query (recommended)
- OR swr (alternative)
// */

// // Placeholder to prevent import errors
// export function useProjects() {
// 	console.log("TODO: Implement useProjects hook");
// 	return {
// 		projects: [],
// 		isLoading: false,
// 		error: null,
// 		createProject: (data: any) => console.log("TODO: Create project", data),
// 		updateProject: (id: string, data: any) =>
// 			console.log(`TODO: Update project ${id}`, data),
// 		deleteProject: (id: string) => console.log(`TODO: Delete project ${id}`),
// 	};
// }
