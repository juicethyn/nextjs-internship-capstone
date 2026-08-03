import {
	CalendarDays,
	ChartColumn,
	FolderKanban,
	LayoutDashboard,
	Settings,
	Users,
} from "lucide-react";

export const NAV_LINKS = [
	{
		id: "dashboard",
		name: "Dashboard",
		href: "dashboard",
		icon: LayoutDashboard,
	},
	{ id: "projects", name: "Projects", href: "projects", icon: FolderKanban },
	{ id: "members", name: "Members", href: "members", icon: Users },
	{ id: "analytics", name: "Analytics", href: "analytics", icon: ChartColumn },
	{ id: "calendar", name: "Calendar", href: "calendar", icon: CalendarDays },
	{ id: "settings", name: "Settings", href: "settings", icon: Settings },
];
