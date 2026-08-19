import { Bell, Palette, Shield, User } from "lucide-react";

export const ACCOUNT_NAV = [
	{ id: "account", name: "Account", href: "/account", icon: User },
	{ id: "security", name: "Security", href: "/account/security", icon: Shield },
	{
		id: "appearance",
		name: "Appearance",
		href: "/account/appearance",
		icon: Palette,
	},
	{
		id: "notifications",
		name: "Notifications",
		href: "/account/notifications",
		icon: Bell,
	},
];

export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
