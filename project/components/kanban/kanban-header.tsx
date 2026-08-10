"use client";

import { ArrowLeft, ArrowUpDown, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { useProject } from "@/hooks/use-project";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
import { ProjectStatusBadge } from "../project/project-status-badge";
import { Button } from "../ui/button";
import { WorkspaceAvatar } from "../workspace-avatar";
import { MemberAvatarStack } from "./member-avatar-stack";
import { ProjectDetailsDialog } from "./project-details-dialog";

type KanbanHeaderProps = {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
};

export function KanbanHeader({
	workspaceSlug,
	projectSlug,
	initialProject,
}: KanbanHeaderProps) {
	const { project } = useProject({
		workspaceSlug,
		projectSlug,
		initialProject,
	});

	const openProjectDetails = useUIStore((state) => state.openProjectDetails);

	return (
		<div
			className="
				sticky
				top-0
				z-10
				-mx-4
				-mt-8
				space-y-3
				border-b
				bg-background
				px-4
				py-4
				sm:-mx-6
				sm:px-6
				lg:-mx-8
				lg:px-8
			"
		>
			<Link
				href={`/w/${workspaceSlug}/projects`}
				className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-3.5" />
				Back to Projects
			</Link>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<button
					type="button"
					onClick={openProjectDetails}
					aria-label={`View details for ${project.name}`}
					className="
						-mx-2
						flex
						min-w-0
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

					<h1 className="truncate text-base font-semibold sm:text-lg">
						{project.name}
					</h1>

					<ProjectStatusBadge status={project.status} />
				</button>

				<div className="flex shrink-0 items-center gap-2">
					<MemberAvatarStack
						members={project.members.map((member) => member.user)}
					/>

					<Button variant="outline" size="sm">
						<UserPlus />
						<span className="hidden sm:inline">Invite</span>
					</Button>

					<Button variant="outline" size="sm">
						<ArrowUpDown />
						<span className="hidden sm:inline">Sort</span>
					</Button>

					<Button variant="outline" size="sm">
						<Settings />
						<span className="hidden sm:inline">Settings</span>
					</Button>
				</div>
			</div>

			<ProjectDetailsDialog project={project} />
		</div>
	);
}
