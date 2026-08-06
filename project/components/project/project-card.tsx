import { CalendarRange, CheckCircle2, Tag, Users } from "lucide-react";
import { WorkspaceAvatar } from "../workspace-avatar";

interface ProjectCardProps {
	name: string;
	description: string;
	color: string;
	status: string;
	progress: number;
	members: number;
	totalTasks: number;
	dueDate: string;
	label?: string[];
}

export function ProjectCard({
	name,
	description,
	color,
	status,
	progress,
	members,
	totalTasks,
	dueDate,
	label = ["Frontend", "Capstone"],
}: ProjectCardProps) {
	return (
		<div className="group flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-wrap gap-1.5">
					{label.map((label) => (
						<span
							key={label}
							className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
						>
							<Tag className="size-2.5" />
							{label}
						</span>
					))}
				</div>

				<div className="flex items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
						<span className="size-1.5 rounded-full bg-primary" />
						{status.at(0)?.toUpperCase() + status.slice(1)}
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
			<div className="flex items-center gap-3 border-t pt-1 text-[11px] text-muted-foreground">
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
		</div>
	);
}
