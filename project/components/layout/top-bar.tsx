"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Image from "next/image";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { GlobalSearch } from "@/features/search/components/global-search";
import { instrumentSerif } from "@/fonts";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

type TopBarProps = {
	workspaceSlug: string;
};

export default function TopBar({ workspaceSlug }: TopBarProps) {
	const { toggleSidebar } = useSidebar();

	return (
		<div className="lg:sticky lg:top-0 px-3 lg:py-2 lg:px-8 h-14 lg:h-16 z-50 flex justify-between items-center gap-3 border-b bg-background">
			<div className="flex shrink-0 items-center gap-x-2 lg:gap-x-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className="lg:hidden"
				>
					<Menu className="size-5" />
					<span className="sr-only">Toggle sidebar</span>
				</Button>

				<div className="flex items-center gap-1.5">
					<Image src="/icons/fora-icon.svg" alt="Fora" width={28} height={28} />
					<h1
						className={`${instrumentSerif.className} hidden text-xl lg:block`}
					>
						Fora
					</h1>
				</div>
			</div>

			<div className="flex min-w-0 flex-1 justify-center">
				<GlobalSearch workspaceSlug={workspaceSlug} />
			</div>

			<div className="flex shrink-0 items-center gap-x-2 lg:gap-x-4">
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
