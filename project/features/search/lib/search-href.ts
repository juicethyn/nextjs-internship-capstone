import type { ProjectResult, TaskResult } from "@/features/search/types";

export function projectHref(workspaceSlug: string, project: ProjectResult) {
	return `/w/${workspaceSlug}/projects/${project.slug}`;
}

export function taskHref(workspaceSlug: string, task: TaskResult) {
	return `/w/${workspaceSlug}/projects/${task.projectSlug}?task=${task.id}`;
}

export function membersHref(workspaceSlug: string) {
	return `/w/${workspaceSlug}/members`;
}
