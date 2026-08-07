import { CalendarRange, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import { LabelBadge } from "../labels/label-badge";
import { WorkspaceAvatar } from "../workspace-avatar";

type ProjectCardLabel = {
	id: string;
	name: string;
	color: string;
};

interface ProjectCardProps {
	href: string;
	name: string;
	description: string;
	color: string;
	status: string;
	progress: number;
	members: number;
	totalTasks: number;
	dueDate: string;
	labels?: ProjectCardLabel[];
}

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
				<div className="flex min-w-0 flex-wrap gap-1.5">
					{labels.map((label) => (
						<LabelBadge
							key={label.id}
							name={label.name}
							color={label.color}
							className="text-[10px]"
						/>
					))}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
						<span className="size-1.5 rounded-full bg-primary" />
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

				<p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
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
					<CalendarRange className="size-3" />
					<span>{dueDate}</span>
				</div>
			</div>
		</Link>
	);
}
