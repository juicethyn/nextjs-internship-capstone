import { CalendarRange, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LabelBadge } from "../labels/label-badge";
import { WorkspaceAvatar } from "../workspace-avatar";

type ProjectCardLabel = {
	id: string;
	name: string;
	color: string;
};

type ProjectStatus = "active" | "completed" | "archived";

interface ProjectCardProps {
	href: string;
	name: string;
	description: string;
	color: string;
	status: ProjectStatus;
	progress: number;
	members: number;
	totalTasks: number;
	dueDate: string;
	labels?: ProjectCardLabel[];
}

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

export function ProjectCard({
	href,
	name,
	description,
	color,
	status,
	progress,
	members,
	totalTasks,
	dueDate,
	labels = [],
}: ProjectCardProps) {
	const statusStyle = PROJECT_STATUS_STYLES[status];
	const visibleLabels = labels.slice(0, 2);
	const remainingLabels = labels.length - visibleLabels.length;

	return (
		<Link
			href={href}
			className="
				group
				flex
				flex-col
				gap-4
				rounded-xl
				border
				bg-card
				p-5
				transition-all
				hover:border-primary/30
				hover:shadow-lg
				hover:shadow-primary/5
				focus-visible:outline-2
				focus-visible:outline-offset-2
				focus-visible:outline-ring
			"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-1 overflow-hidden">
					{visibleLabels.map((label) => (
						<LabelBadge
							key={label.id}
							name={label.name}
							color={label.color}
							className="max-w-25 text-[10px]"
						/>
					))}

					{remainingLabels > 0 && (
						<span className="inline-flex items-center rounded-full border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
							+{remainingLabels}
						</span>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<span
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
							statusStyle.bg,
							statusStyle.text,
							statusStyle.border,
						)}
					>
						<span className={cn("size-1.5 rounded-full", statusStyle.dot)} />
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</span>
				</div>
			</div>

			{/* Project */}
			<div>
				<div className="mb-1.5 flex items-center gap-2.5">
					<WorkspaceAvatar name={name} color={color} size="sm" />
					<h3 className="truncate text-sm font-semibold">{name}</h3>
				</div>

				<p className="line-clamp-2 h-10 break-all text-xs leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>

			{/* Progress */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between">
					<span className="text-[11px] text-muted-foreground">Progress</span>

					<span className="text-[11px] font-medium">{progress}%</span>
				</div>

				<div className="h-1.5 overflow-hidden rounded-full bg-secondary">
					<div
						className="h-full rounded-full"
						style={{
							width: `${progress}%`,
							backgroundColor: color,
						}}
					/>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-auto flex items-center gap-3 border-t pt-1 text-[11px] text-muted-foreground">
				<div className="flex items-center gap-1">
					<Users className="size-3" />
					<span>{members}</span>
				</div>

				<div className="flex items-center gap-1">
					<CheckCircle2 className="size-3" />
					<span>{totalTasks} tasks</span>
				</div>

				<div className="ml-auto flex items-center gap-1">
					{dueDate && (
						<>
							<CalendarRange className="size-3" />
							<span>{dueDate}</span>
						</>
					)}
				</div>
			</div>
		</Link>
	);
}
