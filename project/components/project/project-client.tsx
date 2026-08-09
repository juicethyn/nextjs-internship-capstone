"use client";

import { Suspense, useMemo, useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import {
	DEFAULT_PROJECT_SORT_KEY,
	DEFAULT_PROJECT_STATUS_FILTER,
	filterProjectItems,
	type ProjectSortKey,
	type ProjectStatusFilter,
	sortProjectItems,
	toProjectListItems,
} from "@/lib/utils/project-filters";
import type { ProjectWithRelations } from "@/types/projects";
import { CreateProjectModal } from "../modals/create-project-modal";
import { ProjectGridSkeleton } from "../skeletons/project-grid-skeleton";
import { ProjectsEmptyState } from "./project-empty-state";
import { ProjectGrid } from "./project-grid";
import { ProjectsHeader } from "./project-header";
import { ProjectsToolbar } from "./project-toolbar";

interface ProjectsProps {
	initialProjects: ProjectWithRelations[];
	workspaceSlug: string;
}

export function ProjectClient({
	initialProjects,
	workspaceSlug,
}: ProjectsProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<ProjectStatusFilter>(
		DEFAULT_PROJECT_STATUS_FILTER,
	);
	const [sort, setSort] = useState<ProjectSortKey>(DEFAULT_PROJECT_SORT_KEY);

	const { projects, isLoading } = useProjects({
		workspaceSlug,
		initialProjects,
	});

	const visibleItems = useMemo(
		() =>
			sortProjectItems(
				filterProjectItems(toProjectListItems(projects), search, status),
				sort,
			),
		[projects, search, status, sort],
	);

	const clearFilters = () => {
		setSearch("");
		setStatus(DEFAULT_PROJECT_STATUS_FILTER);
		setSort(DEFAULT_PROJECT_SORT_KEY);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const activeCount = projects.filter(
		(project) => project.status === "active",
	).length;

	const archivedCount = projects.filter(
		(project) => project.status === "archived",
	).length;

	const hasProjects = projects.length > 0;

	return (
		<div className="space-y-6">
			<ProjectsHeader
				onCreateProject={() => setOpen(true)}
				activeCount={activeCount}
				archivedCount={archivedCount}
			/>

			{hasProjects && (
				<ProjectsToolbar
					search={search}
					onSearchChange={setSearch}
					status={status}
					onStatusChange={setStatus}
					sort={sort}
					onSortChange={setSort}
				/>
			)}

			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
					Projects {visibleItems.length}
				</h1>
			</div>

			{!hasProjects && (
				<ProjectsEmptyState
					variant="no-projects"
					onCreateProject={() => setOpen(true)}
				/>
			)}

			{hasProjects && visibleItems.length === 0 && (
				<ProjectsEmptyState
					variant="no-results"
					onClearFilters={clearFilters}
				/>
			)}

			{visibleItems.length > 0 && (
				<Suspense fallback={<ProjectGridSkeleton />}>
					<ProjectGrid items={visibleItems} workspaceSlug={workspaceSlug} />
				</Suspense>
			)}

			<CreateProjectModal
				workspaceSlug={workspaceSlug}
				open={open}
				onOpenChange={setOpen}
			/>
		</div>
	);
}
