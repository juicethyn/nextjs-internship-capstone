"use client";

import { ArrowLeft, ArrowUpDown, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { useProject } from "@/hooks/use-project";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
import { ProjectStatusBadge } from "../project/project-status-badge";
import { ProjectSettingsDialog } from "../project-settings/project-settings-dialog";
import { Button } from "../ui/button";
import { WorkspaceAvatar } from "../workspace-avatar";
import { MemberAvatarStack } from "./member-avatar-stack";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectInviteDialog } from "./project-invite-dialog";

type KanbanHeaderProps = {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
	canManageProject: boolean;
};

export function KanbanHeader({
	workspaceSlug,
	projectSlug,
	initialProject,
	canManageProject,
}: KanbanHeaderProps) {
	const { project } = useProject({
		workspaceSlug,
		projectSlug,
		initialProject,
	});

	const openProjectDetails = useUIStore((state) => state.openProjectDetails);
	const openProjectInvite = useUIStore((state) => state.openProjectInvite);
	const openProjectSettings = useUIStore((state) => state.openProjectSettings);

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

						<Button variant="outline" size="sm">
							<ArrowUpDown className="size-4" />
							<span className="hidden sm:inline">Sort</span>
						</Button>

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
