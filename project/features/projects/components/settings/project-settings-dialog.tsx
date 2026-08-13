"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type ProjectSettingsTab,
	useProjectUIStore,
} from "@/features/projects/store";
import type { ProjectDetail } from "@/features/projects/types";
import { DangerTab } from "./danger-tab";
import { GeneralTab } from "./general-tab";
import { LabelsTab } from "./labels-tab";
import { MembersTab } from "./members-tab";

type ProjectSettingsDialogProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
	canManageProject: boolean;
};

export function ProjectSettingsDialog({
	project,
	workspaceSlug,
	projectSlug,
	canManageProject,
}: ProjectSettingsDialogProps) {
	const isOpen = useProjectUIStore((state) => state.isProjectSettingsOpen);
	const setOpen = useProjectUIStore((state) => state.setProjectSettingsOpen);
	const closeProjectSettings = useProjectUIStore(
		(state) => state.closeProjectSettings,
	);
	const activeTab = useProjectUIStore((state) => state.projectSettingsTab);
	const setTab = useProjectUIStore((state) => state.setProjectSettingsTab);

	return (
		<Dialog open={isOpen} onOpenChange={setOpen}>
			<DialogContent className="flex max-h-[85vh] min-w-0 flex-col gap-0 p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 text-left">
					<DialogTitle className="min-w-0 truncate text-base">
						Project Settings
					</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						Manage this project's details, members, and lifecycle.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(value) => setTab(value as ProjectSettingsTab)}
					className="flex min-h-0 flex-1 flex-col gap-0"
				>
					<div className="shrink-0 px-4 pt-3">
						<TabsList className="w-full sm:w-fit">
							<TabsTrigger value="general">General</TabsTrigger>
							<TabsTrigger value="members">Members</TabsTrigger>
							<TabsTrigger value="labels">Labels</TabsTrigger>
							{canManageProject && (
								<TabsTrigger value="danger">Danger</TabsTrigger>
							)}
						</TabsList>
					</div>

					<div className="board-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
						<TabsContent value="general" className="mt-0">
							<GeneralTab
								project={project}
								workspaceSlug={workspaceSlug}
								projectSlug={projectSlug}
								canManage={canManageProject}
							/>
						</TabsContent>

						<TabsContent value="members" className="mt-0">
							<MembersTab
								project={project}
								workspaceSlug={workspaceSlug}
								projectSlug={projectSlug}
								canManage={canManageProject}
							/>
						</TabsContent>

						<TabsContent value="labels" className="mt-0">
							<LabelsTab
								project={project}
								workspaceSlug={workspaceSlug}
								projectSlug={projectSlug}
							/>
						</TabsContent>

						{canManageProject && (
							<TabsContent value="danger" className="mt-0">
								<DangerTab
									project={project}
									workspaceSlug={workspaceSlug}
									projectSlug={projectSlug}
									onDone={closeProjectSettings}
								/>
							</TabsContent>
						)}
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
