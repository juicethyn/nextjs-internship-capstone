import type { ProjectWithRelations } from "@/types/projects";
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
	return (
		<div className="space-y-6">
			<ProjectsHeader />
			<ProjectsSearchFilter />

			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
					Projects {initialProjects.length}
				</h1>
			</div>

			<ProjectGrid projects={initialProjects} />
		</div>
	);
}
