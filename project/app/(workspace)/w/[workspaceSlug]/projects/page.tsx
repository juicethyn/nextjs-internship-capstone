import { ProjectClient } from "@/components/project/project-client";
import { getProjectsByWorkspaceBySlug } from "@/lib/actions/projects";

type ProjectsProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function ProjectsPage({ params }: ProjectsProps) {
	const { workspaceSlug } = await params;
	const projects = await getProjectsByWorkspaceBySlug(workspaceSlug);

	return (
		<ProjectClient
			initialProjects={projects.projects ?? []}
			workspaceSlug={workspaceSlug}
		/>
	);
}
