import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { getProjectBySlug } from "@/lib/actions/projects";

type ProjectPageProps = {
	params: Promise<{
		workspaceSlug: string;
		projectSlug: string;
	}>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
	const { workspaceSlug, projectSlug } = await params;

	const result = await getProjectBySlug(workspaceSlug, projectSlug);

	if (!result.success) {
		redirect(`/w/${workspaceSlug}/dashboard`);
	}

	// canManage rides along with the project: the guard already loaded the
	// workspace member row to decide access, so gating costs no extra query.
	const { project, canManage } = result.data;

	return (
		<div className="flex h-full min-w-0 w-full flex-col">
			<div className="shrink-0">
				<KanbanHeader
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
					initialProject={project}
					canManageProject={canManage}
				/>
			</div>

			<div className="min-h-0 min-w-0 w-full flex-1 pt-4">
				<KanbanBoard
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
					initialProject={project}
					canManageLists={canManage}
				/>
			</div>
		</div>
	);
}
