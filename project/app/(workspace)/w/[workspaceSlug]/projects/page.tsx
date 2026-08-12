import { redirect } from "next/navigation";
import { ProjectClient } from "@/components/project/project-client";
import { getProjectsByWorkspaceBySlug } from "@/lib/actions/projects";

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
