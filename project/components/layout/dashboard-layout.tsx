import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-side-bar";
import TopBar from "./top-bar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex flex-1 h-dvh flex-col">
				<TopBar />
				<div className="flex flex-1 min-h-0">
					<AppSidebar />
					<main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
