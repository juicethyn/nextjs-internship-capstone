import { CalendarRange, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { LabelBadge } from "../labels/label-badge";
import { WorkspaceAvatar } from "../workspace-avatar";
import { type ProjectStatus, ProjectStatusBadge } from "./project-status-badge";

type ProjectCardLabel = {
	id: string;
	name: string;
	color: string;
};

interface ProjectCardProps {
	href: string;
	name: string;
	description?: string | null;
	color: string;
	status: ProjectStatus;
	progress: number;
	members: number;
	totalTasks: number;
	dueDate: Date | null;
	labels?: ProjectCardLabel[];
}

const MAX_VISIBLE_LABELS = 3;

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
	const visibleLabels = labels.slice(0, MAX_VISIBLE_LABELS);
	const remainingLabels = labels.length - visibleLabels.length;
	const trimmedDescription = description?.trim() || null;

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
				p-4
				transition-all
				hover:border-primary/30
				hover:shadow-lg
				hover:shadow-primary/5
				focus-visible:outline-2
				focus-visible:outline-offset-2
				focus-visible:outline-ring
				sm:p-5
			"
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<WorkspaceAvatar name={name} color={color} size="sm" />

					<h3 className="min-w-0 truncate text-sm font-semibold">{name}</h3>
				</div>

				<ProjectStatusBadge status={status} />
			</div>

			{/* Description and Labels */}
			<div className="space-y-2.5">
				<p
					className={cn(
						"h-5 truncate text-xs leading-relaxed text-muted-foreground",
						!trimmedDescription && "italic opacity-60",
					)}
				>
					{trimmedDescription ?? "No description yet"}
				</p>

				<div className="flex min-h-7 items-center gap-1.5 overflow-hidden">
					{visibleLabels.map((label) => (
						<LabelBadge
							key={label.id}
							name={label.name}
							color={label.color}
							className="min-w-0 shrink"
						/>
					))}

					{remainingLabels > 0 && (
						<span className="inline-flex shrink-0 items-center rounded-full border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
							+{remainingLabels}
						</span>
					)}
				</div>
			</div>

			{/* Progress */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between">
					<span className="text-[11px] text-muted-foreground">Progress</span>

					<span className="text-[11px] font-medium">{progress}%</span>
				</div>

				<div className="h-1.5 overflow-hidden rounded-full bg-secondary">
					<div
						className="h-full rounded-full transition-[width] duration-300"
						style={{
							width: `${progress}%`,
							backgroundColor: color,
						}}
					/>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-auto flex items-center gap-3 border-t pt-3 text-[11px] text-muted-foreground">
				<div className="flex items-center gap-1">
					<Users className="size-3 shrink-0" />
					<span>{members}</span>
				</div>

				<div className="flex items-center gap-1">
					<CheckCircle2 className="size-3 shrink-0" />
					<span>{totalTasks} tasks</span>
				</div>

				{dueDate && (
					<div className="ml-auto flex min-w-0 items-center gap-1">
						<CalendarRange className="size-3 shrink-0" />
						<span className="truncate">{formatProjectDate(dueDate)}</span>
					</div>
				)}
			</div>
		</Link>
	);
}
