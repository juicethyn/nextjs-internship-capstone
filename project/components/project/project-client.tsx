"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import type { ProjectWithRelations } from "@/types/projects";
import { CreateProjectModal } from "../modals/create-project-modal";
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

	return (
		<div className="space-y-6">
			<ProjectsHeader onCreateProject={() => setOpen(true)} />
			<ProjectsSearchFilter />

			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
					Projects {projects.length}
				</h1>
			</div>

			<ProjectGrid projects={projects} workspaceSlug={workspaceSlug} />

			<CreateProjectModal
				workspaceSlug={workspaceSlug}
				open={open}
				onOpenChange={setOpen}
			/>
		</div>
	);
}
