import type { LucideIcon } from "lucide-react";

export type NavLink = {
	label: string;
	href: string;
};

export type Feature = {
	icon: LucideIcon;
	num: string;
	title: string;
	body: string;
	color: string;
};

export type FeatureTab = {
	id: string;
	label: string;
	accent: string;
	headline: string;
	body: string;
	bullets: readonly string[];
	image: string | null;
};

export type ScreenshotFrameProps = {
	src: string | null;
	alt: string;
	label: string;
	variant?: "hero" | "showcase";
	className?: string;
};
