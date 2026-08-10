import { notFound } from "next/navigation";
import { KanbanHeader } from "@/components/kanban/kanban-header";
import { getCurrentUser } from "@/lib/auth";
import { getProjectBySlugWithRelations } from "@/lib/db/queries/projects";
import { requireProjectMember } from "@/lib/permission";

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

	const lists = [...project.lists].sort((a, b) => a.position - b.position);

	return (
		<div className="space-y-6">
			<KanbanHeader
				workspaceSlug={workspaceSlug}
				projectSlug={projectSlug}
				initialProject={project}
			/>

			{/* Board — read-only for now; drag-and-drop is a separate feature. */}
			<div className="flex gap-4 overflow-x-auto pb-4">
				{lists.map((list) => (
					<div
						key={list.id}
						className="w-72 shrink-0 rounded-xl border bg-card"
					>
						<div className="flex items-center justify-between border-b p-3">
							<h2 className="text-sm font-semibold">{list.name}</h2>

							<span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
								{list.tasks.length}
							</span>
						</div>

						<div className="space-y-2 p-3">
							{list.tasks.length === 0 && (
								<p className="py-6 text-center text-xs text-muted-foreground">
									No tasks yet
								</p>
							)}

							{list.tasks.map((task) => (
								<div
									key={task.id}
									className="rounded-lg border bg-background p-3"
								>
									<p className="text-sm font-medium">{task.title}</p>

									{task.description && (
										<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
											{task.description}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
