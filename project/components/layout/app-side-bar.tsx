"use client";

import { ChevronDown, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

// TODO: replace with real data from your API / store
const WORKSPACES = [
	{ id: "1", slug: "fora", name: "Fora Workspace", plan: "Free Plan" },
	{ id: "2", slug: "acme", name: "Acme Inc", plan: "Pro Plan" },
];

export function AppSidebar() {
	const pathname = usePathname();
	const params = useParams();
	const { isMobile } = useSidebar();

	const workspaceSlug = params.workspaceSlug as string;

	const [workspaces] = useState(WORKSPACES);
	const [activeWorkspace, setActiveWorkspace] = useState(
		workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0],
	);

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="border-b">
				<SidebarMenu>
					{/* Workspace switcher + collapse trigger sit side by side */}
					<SidebarMenuItem className="flex items-center gap-1">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="flex-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
										{activeWorkspace.name.charAt(0)}
									</div>

									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{activeWorkspace.name}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{activeWorkspace.plan}
										</span>
									</div>

									<ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
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
										key={workspace.id}
										className="gap-2 p-2"
										onClick={() => setActiveWorkspace(workspace)}
									>
										<div className="flex size-6 items-center justify-center rounded-md border">
											{workspace.name.charAt(0)}
										</div>
										{workspace.name}
									</DropdownMenuItem>
								))}

								<DropdownMenuSeparator />

								<DropdownMenuItem className="gap-2 p-2" asChild>
									<Link href="/workspaces/new">
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Plus className="size-4" />
										</div>
										<span className="font-medium text-muted-foreground">
											New workspace
										</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Collapsible "Workspace" nav group */}
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
										const isActive = pathname === href;

										return (
											<SidebarMenuItem key={item.id}>
												<SidebarMenuButton
													asChild
													className={cn(
														"h-9 rounded-md px-2 transition-colors",
														isActive ? "bg-primary/10" : "hover:bg-zinc-800",
													)}
												>
													<Link
														href={href}
														className={cn(
															"flex w-full items-center gap-3",
															isActive
																? "text-primary"
																: "text-muted-foreground hover:text-white",
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

			<SidebarFooter className="border-t">
				<div className="px-2 py-2 text-xs text-muted-foreground">Fora v1.0</div>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
