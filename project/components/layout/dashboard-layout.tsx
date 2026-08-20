import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PresenceHeartbeat } from "@/features/members/components/presence-heartbeat";
import { NotificationListener } from "@/features/notifications/components/notification-listener";
import type { WorkspaceItem } from "@/features/workspace/types";
import type { WorkspaceMemberRole } from "@/lib/db/types";
import { AppSidebar } from "./app-side-bar";
import TopBar from "./top-bar";

type DashboardLayoutProps = {
	children: React.ReactNode;
	currentWorkspace: WorkspaceItem;
	currentUserRole: WorkspaceMemberRole;
	workspaces: WorkspaceItem[];
	currentUserId: string;
};

export function DashboardLayout({
	children,
	currentWorkspace,
	currentUserRole,
	workspaces,
	currentUserId,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<PresenceHeartbeat workspaceSlug={currentWorkspace.slug} />
			<NotificationListener userId={currentUserId} />

			<div className="flex flex-1 min-w-0 h-dvh flex-col">
				<TopBar workspaceSlug={currentWorkspace.slug} />
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
