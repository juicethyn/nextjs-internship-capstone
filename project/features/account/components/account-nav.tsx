"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_NAV } from "@/features/account/constants";
import { cn } from "@/lib/utils";

export function AccountNav() {
	const pathname = usePathname();

	return (
		<nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
			{ACCOUNT_NAV.map((item) => {
				const isActive = pathname === item.href;

				return (
					<Link
						key={item.id}
						href={item.href}
						className={cn(
							"flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors md:shrink",
							isActive
								? "bg-primary/10 font-medium text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<item.icon className="size-4 shrink-0" />
						{item.name}
					</Link>
				);
			})}
		</nav>
	);
}
