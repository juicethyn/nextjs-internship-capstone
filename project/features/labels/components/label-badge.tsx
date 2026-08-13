"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LabelBadgeProps = {
	name: string;
	color: string;
	className?: string;
	canDelete?: boolean;
	isDeleting?: boolean;
	onDelete?: () => void;
};

export function LabelBadge({
	name,
	color,
	className,
	canDelete = false,
	isDeleting = false,
	onDelete,
}: LabelBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-full border py-1 pl-2.5 text-xs font-medium transition-opacity",
				canDelete ? "pr-1" : "pr-2.5",
				isDeleting && "opacity-50",
				className,
			)}
			style={{
				backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
				borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
			}}
		>
			<span
				className="size-2 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
			/>

			<span className="truncate">{name}</span>

			{canDelete && (
				<Button
					type="button"
					variant="ghost"
					aria-label={`Delete label ${name}`}
					disabled={isDeleting}
					onClick={onDelete}
					className="
						flex
						size-4
						shrink-0
						items-center
						justify-center
						rounded-full
						text-muted-foreground
						transition-colors
						hover:bg-foreground/10
						hover:text-foreground
						focus-visible:outline-1
						focus-visible:outline-ring
						disabled:pointer-events-none
					"
				>
					<X className="size-3" />
				</Button>
			)}
		</span>
	);
}
