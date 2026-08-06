import { getProjectTaskStats } from "@/lib/utils/project-stats";
import type { ProjectWithRelations } from "@/types/projects";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
	projects: ProjectWithRelations[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{projects.map((project) => {
				const taskStats = getProjectTaskStats(project.lists);

				return (
					<ProjectCard
						key={project.slug}
						name={project.name}
						description={project.description ?? ""}
						color={project.color}
						status={project.status}
						members={project.members.length}
						dueDate={
							project.dueDate ? project.dueDate.toLocaleDateString() : ""
						}
						progress={taskStats.progress}
						totalTasks={taskStats.totalTasks}
					/>
				);
			})}
		</div>
	);
}
