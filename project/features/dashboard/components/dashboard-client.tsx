"use client";

import { useState } from "react";
import type { DashboardHeaderData } from "@/features/dashboard/types";
import { WorkspaceInviteDialog } from "@/features/members/components/invitations/workspace-invite-dialog";
import { useMemberUIStore } from "@/features/members/store";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "./create-task-modal";
import { DashboardHeader } from "./dashboard-header";
import { DashboardInsights } from "./dashboard-insights";
import { DashboardWork } from "./dashboard-work";
import { WorkspaceOverview } from "./workspace-overview";

type DashboardClientProps = {
	workspaceSlug: string;
	initialData: DashboardHeaderData;
};

export function DashboardClient({
	workspaceSlug,
	initialData,
}: DashboardClientProps) {
	const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
	const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);

	const openWorkspaceInvite = useMemberUIStore(
		(state) => state.openWorkspaceInvite,
	);

	const canInvite =
		initialData.viewerRole === "owner" || initialData.viewerRole === "admin";

	return (
		<div className="space-y-6">
			<DashboardHeader
				workspaceName={initialData.workspaceName}
				canInvite={canInvite}
				onInvite={openWorkspaceInvite}
				onCreateTask={() => setCreateTaskOpen(true)}
				onCreateProject={() => setCreateProjectOpen(true)}
			/>

			<WorkspaceOverview workspaceSlug={workspaceSlug} />

			<DashboardInsights workspaceSlug={workspaceSlug} />

			<DashboardWork workspaceSlug={workspaceSlug} />

			<CreateProjectModal
				workspaceSlug={workspaceSlug}
				open={isCreateProjectOpen}
				onOpenChange={setCreateProjectOpen}
			/>

			<CreateTaskModal
				workspaceSlug={workspaceSlug}
				open={isCreateTaskOpen}
				onOpenChange={setCreateTaskOpen}
			/>

			{canInvite && (
				<WorkspaceInviteDialog
					workspaceSlug={workspaceSlug}
					workspaceName={initialData.workspaceName}
				/>
			)}
		</div>
	);
}
