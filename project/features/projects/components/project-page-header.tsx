"use client";

import { ArrowLeft, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { ProjectSettingsDialog } from "@/features/projects/components/settings/project-settings-dialog";
import { useProject } from "@/features/projects/hooks/use-project";
import { KanbanSortMenu } from "@/features/projects/kanban/components/kanban-sort-menu";
import { useProjectUIStore } from "@/features/projects/store";
import type { ProjectDetail } from "@/features/projects/types";
import { MemberAvatarStack } from "./member-avatar-stack";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectInviteDialog } from "./project-invite-dialog";

type ProjectPageHeaderProps = {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
	canManageProject: boolean;
};

export function ProjectPageHeader({
	workspaceSlug,
	projectSlug,
	initialProject,
	canManageProject,
}: ProjectPageHeaderProps) {
	const { project } = useProject({
		workspaceSlug,
		projectSlug,
		initialProject,
	});

	const openProjectDetails = useProjectUIStore(
		(state) => state.openProjectDetails,
	);
	const openProjectInvite = useProjectUIStore(
		(state) => state.openProjectInvite,
	);
	const openProjectSettings = useProjectUIStore(
		(state) => state.openProjectSettings,
	);

	return (
		<div className="sticky top-0 z-10 w-full min-w-0 space-y-3 border-b bg-background py-4">
			<Link
				href={`/w/${workspaceSlug}/projects`}
				className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-3.5" />
				Back to Projects
			</Link>

			<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Project Info */}
				<Button
					type="button"
					variant="ghost"
					onClick={openProjectDetails}
					aria-label={`View details for ${project.name}`}
					className="
						-mx-2
						flex
						min-w-0
						max-w-full
						items-center
						gap-2.5
						rounded-lg
						px-2
						py-1
						text-left
						transition-colors
						hover:bg-muted
						focus-visible:outline-2
						focus-visible:outline-offset-2
						focus-visible:outline-ring
					"
				>
					<WorkspaceAvatar
						name={project.name}
						color={project.color}
						size="sm"
					/>

					<h1 className="min-w-0 flex-1 truncate text-base font-semibold sm:text-lg">
						{project.name}
					</h1>

					<div className="shrink-0">
						<ProjectStatusBadge status={project.status} />
					</div>
				</Button>

				{/* Actions */}
				<div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
					<MemberAvatarStack
						members={project.members.map((member) => member.user)}
					/>

					<div className="flex shrink-0 items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={openProjectInvite}
							aria-label="Add members to this project"
						>
							<UserPlus className="size-4" />
							<span className="hidden sm:inline">Invite</span>
						</Button>

						<KanbanSortMenu />

						<Button
							variant="outline"
							size="sm"
							onClick={() => openProjectSettings()}
							aria-label="Open project settings"
						>
							<Settings className="size-4" />
							<span className="hidden sm:inline">Settings</span>
						</Button>
					</div>
				</div>
			</div>

			<ProjectDetailsDialog project={project} />

			<ProjectInviteDialog
				project={project}
				workspaceSlug={workspaceSlug}
				projectSlug={projectSlug}
				canManageProject={canManageProject}
			/>

			<ProjectSettingsDialog
				project={project}
				workspaceSlug={workspaceSlug}
				projectSlug={projectSlug}
				canManageProject={canManageProject}
			/>
		</div>
	);
}
