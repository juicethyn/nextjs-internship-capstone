"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type LabelToggleProps = {
	name: string;
	color: string;
	selected: boolean;
	disabled?: boolean;
	onToggle: () => void;
};

export function LabelToggle({
	name,
	color,
	selected,
	disabled = false,
	onToggle,
}: LabelToggleProps) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			disabled={disabled}
			onClick={onToggle}
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-2.5 text-xs font-medium transition-colors",
				"focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
				!selected && "border-input text-muted-foreground hover:text-foreground",
			)}
			style={
				selected
					? {
							backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
							borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
						}
					: undefined
			}
		>
			{selected ? (
				<Check className="size-3 shrink-0" style={{ color }} />
			) : (
				<span
					className="size-2 shrink-0 rounded-full"
					style={{ backgroundColor: color }}
				/>
			)}

			<span className="truncate">{name}</span>
		</button>
	);
}
