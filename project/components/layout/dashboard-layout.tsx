import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { WorkspaceItem } from "@/types/workspace";
import { AppSidebar } from "./app-side-bar";
import TopBar from "./top-bar";

type DashboardLayoutProps = {
	children: React.ReactNode;
	currentWorkspace: WorkspaceItem;
	workspaces: WorkspaceItem[];
};

export function DashboardLayout({
	children,
	currentWorkspace,
	workspaces,
}: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex flex-1 h-dvh flex-col">
				<TopBar />
				<div className="flex flex-1 min-h-0">
					<AppSidebar
						currentWorkspace={currentWorkspace}
						workspaces={workspaces}
					/>
					<main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
