"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Bell,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Moon,
	Search,
	Settings,
	Sun,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useTheme } from "../theme-provider";
import { ThemeToggle } from "../theme-toggle";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Projects", href: "/projects", icon: FolderOpen },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	return (
		<div className="min-h-screen bg-background dark:bg-background">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-outer_space-500 border-r border-french_gray-300 dark:border-payne's_gray-400 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex items-center justify-between h-16 px-6 border-b border-french_gray-300 dark:border-payne's_gray-400">
					<Link href="/" className="text-2xl font-bold text-blue_munsell-500">
						ProjectFlow
					</Link>
					<button
						onClick={() => setSidebarOpen(false)}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="mt-6 px-3">
					<ul className="space-y-1">
						{navigation.map((item) => {
							const isActive =
								pathname === item.href || pathname.startsWith(`${item.href}/`);
							return (
								<li key={item.name}>
									<Link
										href={item.href}
										className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
											isActive
												? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-primary dark:text-blue_munsell-300"
												: "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
										}`}
									>
										<item.icon className="mr-3" size={20} />
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar */}
				<div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-french_gray-300 dark:border-payne's_gray-400 bg-white dark:bg-outer_space-500 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
					<button
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
					>
						<Menu size={20} />
					</button>

					<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						{/* Search bar placeholder */}
						<div className="flex flex-1 items-center">
							<div className="relative flex-1 max-w-md">
								<Search
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
									size={16}
								/>
								<input
									type="text"
									placeholder="Search projects, tasks..."
									className="w-full pl-10 pr-4 py-2 bg-platinum-500 dark:bg-payne's_gray-400 border border-french_gray-300 dark:border-payne's_gray-300 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
								/>
							</div>
						</div>

						<div className="flex items-center gap-x-4 lg:gap-x-6">
							<button className="p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400">
								<Bell size={20} />
							</button>

							<ThemeToggle />

							<UserButton />
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
