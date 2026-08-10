"use client";

import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useProject } from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/types/projects";
import { CreateListButton } from "./create-list-button";
import { CreateListDialog } from "./create-list-dialog";
import { ListCard } from "./list-card";

type KanbanBoardProps = {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
	canManageLists: boolean;
};

export function KanbanBoard({
	workspaceSlug,
	projectSlug,
	initialProject,
	canManageLists,
}: KanbanBoardProps) {
	const { project } = useProject({
		workspaceSlug,
		projectSlug,
		initialProject,
	});

	const lists = [...project.lists].sort((a, b) => a.position - b.position);

	const { ref, isDragging, dragHandlers } = useDragScroll<HTMLDivElement>();

	return (
		<>
			<div
				ref={ref}
				{...dragHandlers}
				className={cn(
					"board-scrollbar flex h-full snap-x snap-mandatory scroll-smooth items-start gap-4 overflow-x-auto overflow-y-hidden pb-4 sm:snap-none sm:cursor-grab",
					isDragging && "sm:cursor-grabbing select-none scroll-auto",
				)}
			>
				{lists.map((list) => (
					<ListCard
						key={list.id}
						list={list}
						workspaceSlug={workspaceSlug}
						projectSlug={projectSlug}
						canManage={canManageLists}
					/>
				))}

				{canManageLists && <CreateListButton />}
			</div>

			{canManageLists && (
				<CreateListDialog
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
				/>
			)}
		</>
	);
}
