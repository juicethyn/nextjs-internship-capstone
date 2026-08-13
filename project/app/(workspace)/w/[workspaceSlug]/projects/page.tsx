import { redirect } from "next/navigation";
import { getProjectsByWorkspaceBySlug } from "@/features/projects/actions/projects";
import { ProjectClient } from "@/features/projects/components/project-client";

type ProjectsProps = {
	params: Promise<{
		workspaceSlug: string;
	}>;
};

export default async function ProjectsPage({ params }: ProjectsProps) {
	const { workspaceSlug } = await params;

	const result = await getProjectsByWorkspaceBySlug(workspaceSlug);

	if (!result.success) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	return (
		<ProjectClient
			initialProjects={result.data}
			workspaceSlug={workspaceSlug}
		/>
	);
}
