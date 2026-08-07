import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LabelBadge } from "@/components/labels/label-badge";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { getCurrentUser } from "@/lib/auth";
import { getProjectBySlugWithRelations } from "@/lib/db/queries/projects";
import { requireProjectMember } from "@/lib/permission";
import { getProjectTaskStats } from "@/lib/utils/project-stats";

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

	const taskStats = getProjectTaskStats(project.lists);
	const lists = [...project.lists].sort((a, b) => a.position - b.position);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-4">
				<Link
					href={`/w/${workspaceSlug}/projects`}
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to projects
				</Link>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 items-start gap-3 sm:gap-4">
						<WorkspaceAvatar
							name={project.name}
							color={project.color}
							size="md"
						/>

						<div className="min-w-0">
							<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
								{project.name}
							</h1>

							{project.description && (
								<p className="mt-1 text-sm text-muted-foreground">
									{project.description}
								</p>
							)}

							<div className="mt-3 flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
									<span className="size-1.5 rounded-full bg-primary" />
									{project.status.charAt(0).toUpperCase() +
										project.status.slice(1)}
								</span>

								{project.projectLabels.map(({ workspaceLabel }) => (
									<LabelBadge
										key={workspaceLabel.id}
										name={workspaceLabel.name}
										color={workspaceLabel.color}
										className="text-[10px]"
									/>
								))}
							</div>
						</div>
					</div>

					<dl className="flex shrink-0 gap-6 text-sm">
						<div>
							<dt className="text-xs text-muted-foreground">Progress</dt>
							<dd className="font-semibold">{taskStats.progress}%</dd>
						</div>

						<div>
							<dt className="text-xs text-muted-foreground">Tasks</dt>
							<dd className="font-semibold">{taskStats.totalTasks}</dd>
						</div>

						<div>
							<dt className="text-xs text-muted-foreground">Members</dt>
							<dd className="font-semibold">{project.members.length}</dd>
						</div>
					</dl>
				</div>
			</div>

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
