"use client";

import {
	Check,
	ChevronDown,
	ChevronsUpDown,
	Plus,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { NAV_LINKS } from "@/constants/navigation";
import { switchWorkspaceAction } from "@/lib/actions/workspaces";
import { cn } from "@/lib/utils";
import type { WorkspaceItem, WorkspaceMemberRole } from "@/types/workspace";
import { CreateWorkspaceModal } from "../modals/create-workspace-modal";
import { WorkspaceAvatar } from "../workspace-avatar";
import { WorkspaceSettingsModal } from "../workspace-settings/workspace-settings-modal";

type AppSidebarProps = {
	currentWorkspace: WorkspaceItem;
	currentUserRole: WorkspaceMemberRole;
	workspaces: WorkspaceItem[];
};

export function AppSidebar({
	currentWorkspace,
	currentUserRole,
	workspaces,
}: AppSidebarProps) {
	const pathname = usePathname();
	const { isMobile } = useSidebar();
	const workspaceSlug = currentWorkspace.slug;
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const handleSwitchWorkspace = (workspace: WorkspaceItem) => {
		startTransition(async () => {
			await switchWorkspaceAction(workspace.slug);

			toast.success(`Switched to workspace ${workspace.name}`);
			router.push(`/w/${workspace.slug}/dashboard`);
			router.refresh();
		});
	};
	const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
	const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = useState(false);
	return (
		<>
			<Sidebar collapsible="icon">
				<SidebarHeader className="border-b">
					{/* Workspace Switcher */}
					<SidebarMenu>
						<SidebarMenuItem
							className={cn(
								"flex items-center gap-1",
								"group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1",
							)}
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="
										flex-1
										group-data-[collapsible=icon]:justify-center
										group-data-[collapsible=icon]:px-0
										data-[state=open]:bg-sidebar-accent
										data-[state=open]:text-sidebar-accent-foreground
									"
									>
										<WorkspaceAvatar
											name={currentWorkspace.name}
											color={currentWorkspace.color}
											size="xs"
										/>

										<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
											<span className="truncate font-semibold">
												{currentWorkspace.name}
											</span>
										</div>

										<ChevronsUpDown
											className="
												ml-auto size-4
												group-data-[collapsible=icon]:hidden
											"
										/>
									</SidebarMenuButton>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
									align="start"
									side={isMobile ? "bottom" : "right"}
									sideOffset={4}
								>
									<DropdownMenuLabel className="text-xs text-muted-foreground">
										Workspaces
									</DropdownMenuLabel>

									{workspaces.map((workspace) => (
										<DropdownMenuItem
											disabled={
												isPending || workspace.id === currentWorkspace.id
											}
											key={workspace.id}
											className="gap-2 p-2"
											onClick={() => handleSwitchWorkspace(workspace)}
										>
											<WorkspaceAvatar
												name={workspace.name}
												color={workspace.color}
												size="xs"
											/>
											<span>{workspace.name}</span>

											{workspace.id === currentWorkspace.id && (
												<Check className="ml-auto h-4 w-4 text-primary" />
											)}
										</DropdownMenuItem>
									))}

									<DropdownMenuSeparator />

									<DropdownMenuItem
										className="gap-2 p-2"
										onSelect={(e) => {
											e.preventDefault();
											setWorkspaceSettingsOpen(true);
										}}
									>
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Settings className="size-4" />
										</div>

										<span className="font-medium text-muted-foreground">
											Workspace settings
										</span>
									</DropdownMenuItem>

									<DropdownMenuItem
										className="gap-2 p-2"
										onSelect={(e) => {
											e.preventDefault();
											setCreateWorkspaceOpen(true);
										}}
									>
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Plus className="size-4" />
										</div>

										<span className="font-medium text-muted-foreground">
											Create workspace
										</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* No longer hides itself away when collapsed — just recenters under the avatar */}
							<SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:mx-auto hidden lg:block" />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				{/* Navigations */}
				<SidebarContent>
					<Collapsible defaultOpen className="group/collapsible">
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger className="flex w-full cursor-pointer items-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
									Workspace
									<ChevronDown className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>

							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{NAV_LINKS.map((item) => {
											const href = `/w/${workspaceSlug}${item.href ? `/${item.href}` : ""}`;
											const isActive =
												pathname === href || pathname.startsWith(`${href}/`);

											return (
												<SidebarMenuItem key={item.id}>
													<SidebarMenuButton
														asChild
														className={cn(
															"h-9 rounded-md px-2 transition-colors",
															isActive ? "bg-primary/10" : "",
														)}
													>
														<Link
															href={href}
															className={cn(
																"flex w-full items-center gap-3",
																isActive
																	? "text-primary"
																	: "text-muted-foreground hover:text-foreground",
															)}
														>
															<item.icon className="h-4 w-4 shrink-0" />
															<span>{item.name}</span>
															{isActive && (
																<div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
															)}
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										})}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				</SidebarContent>

				{/* Footer */}
				<SidebarFooter className="border-t">
					<div className="px-2 py-2 text-xs text-muted-foreground">
						Fora v1.0
					</div>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>

			<CreateWorkspaceModal
				open={createWorkspaceOpen}
				onOpenChange={setCreateWorkspaceOpen}
			/>

			<WorkspaceSettingsModal
				workspace={currentWorkspace}
				currentUserRole={currentUserRole}
				open={workspaceSettingsOpen}
				onOpenChange={setWorkspaceSettingsOpen}
			/>
		</>
	);
}
