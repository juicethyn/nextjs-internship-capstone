"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export default function TopBar() {
	const { toggleSidebar } = useSidebar();

	return (
		<div className="lg:sticky lg:top-0 px-3 lg:py-2 lg:px-8 h-14 lg:h-16 z-50 flex justify-between items-center border-b bg-background">
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleSidebar}
				className="lg:hidden"
			>
				<Menu className="size-5" />
				<span className="sr-only">Toggle sidebar</span>
			</Button>
			{/* Fora Brand and Icon */}
			<div className="flex items-center gap-x-2 lg:gap-x-4">
				<h1 className="text-xl font-bold">Fora</h1>
			</div>

			<div className="flex items-center gap-x-2 lg:gap-x-4">
				<NotificationBell />
				<UserButton
					appearance={{
						elements: {
							userButtonPopoverActionButton__manageAccount: {
								display: "none",
							},
						},
					}}
				/>
			</div>
		</div>
	);
}
