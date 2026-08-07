"use client";

import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export function ThemedToaster() {
	const { theme = "system" } = useTheme();

	return (
		<Toaster
			theme={theme as "light" | "dark" | "system"}
			position="bottom-right"
		/>
	);
}
