import { cn } from "@/lib/utils";

export type ProjectStatus = "active" | "completed" | "archived";

export const PROJECT_STATUS_STYLES = {
	active: {
		bg: "bg-emerald-100 dark:bg-emerald-500/15",
		text: "text-emerald-700 dark:text-emerald-400",
		dot: "bg-emerald-500",
		border: "border-emerald-200 dark:border-emerald-500/20",
	},
	completed: {
		bg: "bg-sky-100 dark:bg-sky-500/15",
		text: "text-sky-700 dark:text-sky-400",
		dot: "bg-sky-500",
		border: "border-sky-200 dark:border-sky-500/20",
	},
	archived: {
		bg: "bg-muted",
		text: "text-muted-foreground",
		dot: "bg-muted-foreground",
		border: "border-border",
	},
} as const;

type ProjectStatusBadgeProps = {
	status: ProjectStatus;
	className?: string;
};

export function ProjectStatusBadge({
	status,
	className,
}: ProjectStatusBadgeProps) {
	const statusStyle = PROJECT_STATUS_STYLES[status];

	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
				statusStyle.bg,
				statusStyle.text,
				statusStyle.border,
				className,
			)}
		>
			<span className={cn("size-1.5 rounded-full", statusStyle.dot)} />
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
}
