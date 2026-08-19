"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { ThemePreview } from "./theme-preview";

const THEME_OPTIONS = [
	{
		value: "dark",
		label: "Dark",
		description: "Easy on the eyes at night",
	},
	{
		value: "light",
		label: "Light",
		description: "Clean and bright interfaces",
	},
] as const;

export function ThemeCards() {
	const { theme, setTheme } = useTheme();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{THEME_OPTIONS.map((option) => {
				const isActive = mounted && theme === option.value;

				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => setTheme(option.value)}
						className={cn(
							"space-y-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/40",
							isActive && "border-primary ring-2 ring-primary/30",
						)}
					>
						<ThemePreview variant={option.value} />

						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<p className="text-sm font-medium">{option.label}</p>

								<p className="text-xs text-muted-foreground">
									{option.description}
								</p>
							</div>

							{isActive && <Check className="size-4 shrink-0 text-primary" />}
						</div>
					</button>
				);
			})}
		</div>
	);
}
