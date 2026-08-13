import type React from "react";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { WorkspaceItem, WorkspaceMemberRole } from "@/types/workspace";
import { AppSidebar } from "./app-side-bar";
import TopBar from "./top-bar";

type DashboardLayoutProps = {
	children: React.ReactNode;
	currentWorkspace: WorkspaceItem;
	currentUserRole: WorkspaceMemberRole;
	workspaces: WorkspaceItem[];
};

export function DashboardLayout({
	children,
	currentWorkspace,
	currentUserRole,
	workspaces,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<PresenceHeartbeat workspaceSlug={currentWorkspace.slug} />

			<div className="flex flex-1 min-w-0 h-dvh flex-col">
				<TopBar />
				<div className="flex flex-1 min-w-0 min-h-0">
					<AppSidebar
						currentWorkspace={currentWorkspace}
						currentUserRole={currentUserRole}
						workspaces={workspaces}
					/>
					<main className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
