"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceItem, WorkspaceMemberRole } from "@/types/workspace";
import { DangerTab } from "../workspace-settings/danger-tab";
import { GeneralTab } from "../workspace-settings/general-tab";
import { LabelsTab } from "../workspace-settings/labels-tab";

type WorkspaceSettingsModalProps = {
	workspace: WorkspaceItem;
	currentUserRole: WorkspaceMemberRole;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function WorkspaceSettingsModal({
	workspace,
	currentUserRole,
	open,
	onOpenChange,
}: WorkspaceSettingsModalProps) {
	const isOwner = currentUserRole === "owner";
	const isAdmin = isOwner || currentUserRole === "admin";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Workspace Settings</DialogTitle>

					<DialogDescription>
						Manage your workspace details, labels, and ownership.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="general" className="mt-2">
					<TabsList className="w-full sm:w-fit">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="labels">Labels</TabsTrigger>
						{isOwner && <TabsTrigger value="danger">Danger</TabsTrigger>}
					</TabsList>

					<TabsContent value="general" className="pt-4">
						<GeneralTab workspace={workspace} canEdit={isOwner} />
					</TabsContent>

					<TabsContent value="labels" className="pt-4">
						<LabelsTab workspaceSlug={workspace.slug} canEdit={isAdmin} />
					</TabsContent>

					{isOwner && (
						<TabsContent value="danger" className="pt-4">
							<DangerTab
								workspaceSlug={workspace.slug}
								onTransferred={() => onOpenChange(false)}
							/>
						</TabsContent>
					)}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
