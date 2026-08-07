"use client";

import { Suspense, useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import type { ProjectWithRelations } from "@/types/projects";
import { CreateProjectModal } from "../modals/create-project-modal";
import { ProjectGridSkeleton } from "../skeletons/project-grid-skeleton";
import { ProjectGrid } from "./project-grid";
import { ProjectsHeader } from "./project-header";
import { ProjectsSearchFilter } from "./project-search-filter";

interface ProjectsProps {
	initialProjects: ProjectWithRelations[];
	workspaceSlug: string;
}

export function ProjectClient({
	initialProjects,
	workspaceSlug,
}: ProjectsProps) {
	const [open, setOpen] = useState(false);

	const { projects, isLoading } = useProjects({
		workspaceSlug,
		initialProjects,
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const activeCount = projects.filter(
		(project) => project.status === "active",
	).length;

	const archivedCount = projects.filter(
		(project) => project.status === "archived",
	).length;

	return (
		<div className="space-y-6">
			<ProjectsHeader
				onCreateProject={() => setOpen(true)}
				activeCount={activeCount}
				archivedCount={archivedCount}
			/>
			<ProjectsSearchFilter />

			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
					Projects {projects.length}
				</h1>
			</div>

			<Suspense fallback={<ProjectGridSkeleton />}>
				<ProjectGrid projects={projects} workspaceSlug={workspaceSlug} />
			</Suspense>

			<CreateProjectModal
				workspaceSlug={workspaceSlug}
				open={open}
				onOpenChange={setOpen}
			/>
		</div>
	);
}
