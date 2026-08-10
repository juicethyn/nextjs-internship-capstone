import type { ProjectListItem } from "@/lib/utils/project-filters";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
	items: ProjectListItem[];
	workspaceSlug: string;
}

export function ProjectGrid({ items, workspaceSlug }: ProjectGridProps) {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{items.map(({ project, stats }) => (
				<ProjectCard
					key={project.id}
					href={`/w/${workspaceSlug}/projects/${project.slug}`}
					name={project.name}
					description={project.description}
					color={project.color}
					status={project.status}
					members={project.members.length}
					labels={project.projectLabels.map(
						(projectLabel) => projectLabel.workspaceLabel,
					)}
					dueDate={project.dueDate}
					progress={stats.progress}
					totalTasks={stats.totalTasks}
				/>
			))}
		</div>
	);
}
