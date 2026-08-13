import { ProjectPageHeaderSkeleton } from "@/features/projects/components/project-page-header-skeleton";
import { KanbanBoardSkeleton } from "@/features/projects/kanban/components/kanban-board-skeleton";

// Same shell as the page itself, so the header stays put and only the columns
// swap when the project resolves.
export default function Loading() {
	return (
		<div className="flex h-full w-full min-w-0 flex-col">
			<div className="shrink-0">
				<ProjectPageHeaderSkeleton />
			</div>

			<div className="min-h-0 w-full min-w-0 flex-1 pt-4">
				<KanbanBoardSkeleton />
			</div>
		</div>
	);
}
