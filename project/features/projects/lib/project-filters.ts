import type { ProjectWithRelations } from "@/features/projects/types";
import { getProjectTaskStats } from "./project-stats";

export type ProjectStatusFilter = "all" | "active" | "completed" | "archived";

export type ProjectSortKey = "name" | "progress" | "dueDate";

export type ProjectListItem = {
	project: ProjectWithRelations;
	stats: ReturnType<typeof getProjectTaskStats>;
};

export const PROJECT_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
	{ value: "archived", label: "Archived" },
] as const satisfies readonly { value: ProjectStatusFilter; label: string }[];

export const PROJECT_SORT_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "progress", label: "Progress" },
	{ value: "dueDate", label: "Due Date" },
] as const satisfies readonly { value: ProjectSortKey; label: string }[];

export const DEFAULT_PROJECT_STATUS_FILTER: ProjectStatusFilter = "all";

export const DEFAULT_PROJECT_SORT_KEY: ProjectSortKey = "name";

export function toProjectListItems(
	projects: ProjectWithRelations[],
): ProjectListItem[] {
	return projects.map((project) => ({
		project,
		stats: getProjectTaskStats(project.lists),
	}));
}

export function filterProjectItems(
	items: ProjectListItem[],
	query: string,
	status: ProjectStatusFilter,
): ProjectListItem[] {
	const normalizedQuery = query.trim().toLowerCase();

	return items.filter(({ project }) => {
		const matchesStatus = status === "all" || project.status === status;

		const matchesQuery =
			normalizedQuery === "" ||
			project.name.toLowerCase().includes(normalizedQuery);

		return matchesStatus && matchesQuery;
	});
}

function compareByName(a: ProjectListItem, b: ProjectListItem) {
	return a.project.name.localeCompare(b.project.name, undefined, {
		sensitivity: "base",
	});
}

export function sortProjectItems(
	items: ProjectListItem[],
	key: ProjectSortKey,
): ProjectListItem[] {
	return [...items].sort((a, b) => {
		if (key === "progress") {
			return b.stats.progress - a.stats.progress || compareByName(a, b);
		}

		if (key === "dueDate") {
			const aDue = a.project.dueDate?.getTime() ?? null;
			const bDue = b.project.dueDate?.getTime() ?? null;

			if (aDue === null && bDue === null) return compareByName(a, b);
			if (aDue === null) return 1;
			if (bDue === null) return -1;

			return aDue - bDue || compareByName(a, b);
		}

		return compareByName(a, b);
	});
}
