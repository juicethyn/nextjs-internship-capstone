import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { getCurrentUser } from "@/lib/auth";
import { getProjectBySlugWithRelations } from "@/lib/db/queries/projects";
import { isProjectManager, requireProjectMember } from "@/lib/permission";

type ProjectPageProps = {
	params: Promise<{
		workspaceSlug: string;
		projectSlug: string;
	}>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { workspaceSlug, projectSlug } = await params;

	const user = await getCurrentUser();

	// Redirects to the workspace dashboard when the project is missing or the
	// user is not a member of it.
	const { workspaceId } = await requireProjectMember(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	// requireProjectMember returns a bare row — refetch with relations.
	const project = await getProjectBySlugWithRelations(workspaceId, projectSlug);

	if (!project) {
		notFound();
	}

	// Drives lists, members, settings, and the danger zone.
	const canManageProject = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	return (
		<div className="flex h-full min-w-0 w-full flex-col">
			<div className="shrink-0">
				<KanbanHeader
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
					initialProject={project}
					canManageProject={canManageProject}
				/>
			</div>

			<div className="min-h-0 min-w-0 w-full flex-1 pt-4">
				<KanbanBoard
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
					initialProject={project}
					canManageLists={canManageProject}
				/>
			</div>
		</div>
	);
}
