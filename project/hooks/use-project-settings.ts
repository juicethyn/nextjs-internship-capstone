"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	archiveProjectAction,
	deleteProjectAction,
	restoreProjectAction,
	updateProjectAction,
} from "@/lib/actions/projects";
import type { ProjectGeneralSettingsInput } from "@/lib/validations/project";

interface UseProjectSettingsProps {
	workspaceSlug: string;
	projectSlug: string;
}

function toMessage(message: unknown, fallback: string) {
	return typeof message === "string" && message.length > 0 ? message : fallback;
}

export function useProjectSettings({
	workspaceSlug,
	projectSlug,
}: UseProjectSettingsProps) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const invalidateProject = () => {
		queryClient.invalidateQueries({
			queryKey: ["project", workspaceSlug, projectSlug],
		});
		queryClient.invalidateQueries({ queryKey: ["projects", workspaceSlug] });
	};

	const updateMutation = useMutation({
		mutationFn: (data: ProjectGeneralSettingsInput) =>
			updateProjectAction(workspaceSlug, projectSlug, data),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to update project."));
				return;
			}

			toast.success(toMessage(result.message, "Project updated."));
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to update project.");
		},
	});

	const archiveMutation = useMutation({
		mutationFn: () => archiveProjectAction(workspaceSlug, projectSlug),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to archive project."));
				return;
			}

			toast.success(toMessage(result.message, "Project archived."));
			invalidateProject();
			router.push(`/w/${workspaceSlug}/projects`);
		},

		onError: () => {
			toast.error("Failed to archive project.");
		},
	});

	const restoreMutation = useMutation({
		mutationFn: () => restoreProjectAction(workspaceSlug, projectSlug),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to restore project."));
				return;
			}

			toast.success(toMessage(result.message, "Project restored."));
			invalidateProject();
		},

		onError: () => {
			toast.error("Failed to restore project.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteProjectAction(workspaceSlug, projectSlug),

		onSuccess: (result) => {
			if (!result.success) {
				toast.error(toMessage(result.message, "Failed to delete project."));
				return;
			}

			toast.success(toMessage(result.message, "Project deleted."));
			queryClient.invalidateQueries({ queryKey: ["projects", workspaceSlug] });
			router.push(`/w/${workspaceSlug}/projects`);
		},

		onError: () => {
			toast.error("Failed to delete project.");
		},
	});

	return {
		updateProject: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		archiveProject: archiveMutation.mutateAsync,
		isArchiving: archiveMutation.isPending,

		restoreProject: restoreMutation.mutateAsync,
		isRestoring: restoreMutation.isPending,

		deleteProject: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
