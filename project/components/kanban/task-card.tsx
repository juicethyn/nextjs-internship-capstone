import { cn } from "@/lib/utils";
import { LIST_TYPE_STYLES } from "@/lib/utils/list-styles";
import type { ListType } from "@/types/list";
import type { ProjectDetail } from "@/types/projects";

type KanbanTask = ProjectDetail["lists"][number]["tasks"][number];

type TaskCardProps = {
	task: KanbanTask;
	listType: ListType;
};

export function TaskCard({ task, listType }: TaskCardProps) {
	const typeStyle = LIST_TYPE_STYLES[listType];

	return (
		<div
			className={cn(
				"rounded-lg border border-l-4 bg-background p-3 transition-colors hover:bg-muted/50",
				typeStyle.border,
			)}
		>
			<p className={cn("wrap-break-word text-sm font-medium", typeStyle.title)}>
				{task.title}
			</p>

			{task.description && (
				<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
					{task.description}
				</p>
			)}
		</div>
	);
}
