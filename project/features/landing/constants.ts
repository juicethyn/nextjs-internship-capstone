import { BarChart3, CalendarDays, FolderKanban, Users } from "lucide-react";
import type { Feature, FeatureTab, NavLink } from "./types";

export const NAV_LINKS: NavLink[] = [
	{ label: "Features", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
];

export const FEATURES: Feature[] = [
	{
		icon: FolderKanban,
		num: "01",
		title: "Projects built for clarity",
		body: "Organize work into projects with kanban boards, list views, and deadline tracking. Every task has a home.",
		color: "#8200db",
	},
	{
		icon: Users,
		num: "02",
		title: "Work better, together",
		body: "Invite your team, assign tasks, and stay aligned with real-time updates. Everyone always knows what's next.",
		color: "#0ea5e9",
	},
	{
		icon: BarChart3,
		num: "03",
		title: "Progress you can see",
		body: "Track team velocity, visualize project health, and spot bottlenecks before they slow you down.",
		color: "#10b981",
	},
	{
		icon: CalendarDays,
		num: "04",
		title: "Deadlines at a glance",
		body: "See every milestone and due date in a single calendar view. Never lose track of what's due.",
		color: "#f59e0b",
	},
];

export const HERO_SCREENSHOT: { src: string | null; label: string } = {
	src: "/images/projects.png",
	label: "Kanban board — Q4 Product Launch",
};

export const FEATURE_TABS: FeatureTab[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		accent: "#8200db",
		headline: "Your workspace, at a glance",
		body: "Open Fora and immediately know where everything stands — active projects, team health, and recent activity — no digging required.",
		bullets: [
			"Live recent activity feed",
			"Workspace health donut chart",
			"Quick stats: projects, tasks, members",
		],
		image: "/images/dashboard.png",
	},
	{
		id: "kanban",
		label: "Kanban Board",
		accent: "#f59e0b",
		headline: "Tasks that move with your team",
		body: "Visualize work across every stage. Drag, prioritize, and track cards with full context — tags, assignees, and due dates all in one place.",
		bullets: [
			"Drag-and-drop columns",
			"Priority and label tagging",
			"Per-project customization",
		],
		image: "/images/hero-image.png",
	},
	{
		id: "analytics",
		label: "Analytics",
		accent: "#10b981",
		headline: "Progress you can act on",
		body: "Track team velocity, completion rates, and priority distribution. Know exactly where your team stands — without ever asking for a status update.",
		bullets: [
			"Project progress bar charts",
			"Team efficiency & velocity metrics",
			"Task priority distribution",
		],
		image: "/images/analytics.png",
	},
	{
		id: "calendar",
		label: "Calendar",
		accent: "#0ea5e9",
		headline: "Never miss a deadline",
		body: "Every task deadline and custom event, on one shared calendar. Switch between month and week views so your schedule adapts to how you work.",
		bullets: [
			"Month and week views",
			"Task deadline overlay",
			"Custom event creation",
		],
		image: "/images/calendar.png",
	},
];
