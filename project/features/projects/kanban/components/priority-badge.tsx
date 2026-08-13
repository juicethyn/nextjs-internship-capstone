import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TaskPriority } from "@/lib/db/types";
import { cn } from "@/lib/utils";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
	none: "None",
	low: "Low",
	medium: "Medium",
	high: "High",
};

export const PRIORITY_ICON_STYLES: Record<TaskPriority, string> = {
	none: "text-muted-foreground",
	low: "text-sky-600 dark:text-sky-400",
	medium: "text-amber-600 dark:text-amber-400",
	high: "text-red-600 dark:text-red-400",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
	none: "border-border bg-muted text-muted-foreground",
	low: "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400",
	medium:
		"border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400",
	high: "border-red-200 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-400",
};

type PriorityBadgeProps = {
	priority: TaskPriority;
	className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
	return (
		<Badge className={cn(PRIORITY_STYLES[priority], className)}>
			<Flag />
			{PRIORITY_LABELS[priority]}
		</Badge>
	);
}
