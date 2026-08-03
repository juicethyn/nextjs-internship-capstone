import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { SidebarTrigger } from "../ui/sidebar";

export default function TopBar() {
	return (
		<div className="lg:sticky lg:top-0 px-3 lg:py-2 lg:px-8 h-14 lg:h-16 z-50 flex justify-between items-center border-b">
			<SidebarTrigger className="lg:hidden" />
			{/* Fora Brand and Icon */}
			<div className="flex items-center gap-x-2 lg:gap-x-4">
				<h1 className="text-xl font-bold">Fora</h1>
			</div>

			<ThemeToggle />

			<div className="flex items-center gap-x-2 lg:gap-x-4">
				<button
					type="button"
					className="p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
				>
					<Bell size={20} />
				</button>
				<UserButton />
			</div>
		</div>
	);
}
