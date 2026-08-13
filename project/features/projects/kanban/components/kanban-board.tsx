"use client";

import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import { useProject } from "@/features/projects/hooks/use-project";
import { useDragScroll } from "@/features/projects/kanban/hooks/use-drag-scroll";
import { useLists } from "@/features/projects/kanban/hooks/use-lists";
import { useTasks } from "@/features/projects/kanban/hooks/use-tasks";
import {
	findListIdByTaskId,
	getNeighbourPositions,
} from "@/features/projects/kanban/lib/board-dnd";
import { useProjectUIStore } from "@/features/projects/store";
import type { ProjectDetail } from "@/features/projects/types";
import { calculatePosition } from "@/lib/positioning";
import { cn } from "@/lib/utils";
import { CreateListButton } from "./create-list-button";
import { CreateListDialog } from "./create-list-dialog";
import { ListCard } from "./list-card";
import { TaskCard } from "./task-card";
import { TaskDetailsDialog } from "./task-details-dialog";

type KanbanBoardProps = {
	workspaceSlug: string;
	projectSlug: string;
	initialProject: ProjectDetail;
	canManageLists: boolean;
};

type KanbanList = ProjectDetail["lists"][number];
type KanbanTask = KanbanList["tasks"][number];

// A drop target is either a card or a list body; both resolve to a list id.
function resolveListId(data: Record<string, unknown> | undefined) {
	if (!data) return undefined;

	if (data.type === "list") {
		return (data.list as KanbanList | undefined)?.id;
	}

	return data.listId as string | undefined;
}

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

	const { moveList } = useLists({ workspaceSlug, projectSlug });
	const { moveTask, previewTaskMove } = useTasks({
		workspaceSlug,
		projectSlug,
	});

	const lists = project.lists;

	const { ref, isDragging, dragHandlers } = useDragScroll<HTMLDivElement>();

	const openTaskId = useProjectUIStore((state) => state.openTaskId);
	const taskSort = useProjectUIStore((state) => state.taskSort);

	const [activeList, setActiveList] = useState<KanbanList | null>(null);
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

	// Where the card started, so onDragEnd can tell a real move from a no-op
	// after handleDragOver has already relocated it in the cache.
	const dragOriginListId = useRef<string | null>(null);

	// Mouse and touch are split deliberately. A single PointerSensor with a
	// distance constraint treats a vertical swipe as a drag, which makes a long
	// list impossible to scroll on touch.
	//   mouse — 8px of travel, so a plain click still opens the card
	//   touch — press and hold; moving more than 5px before then is a scroll
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const openListEntry = lists
		.map((list) => ({
			list,
			task: list.tasks.find((task) => task.id === openTaskId),
		}))
		.find((entry) => entry.task);

	const openTask = openListEntry?.task ?? null;

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current;

		if (data?.type === "list") {
			setActiveList(data.list as KanbanList);
			return;
		}

		if (data?.type === "task") {
			setActiveTask(data.task as KanbanTask);
			dragOriginListId.current = data.listId as string;
		}
	};

	const clearActive = () => {
		setActiveList(null);
		setActiveTask(null);
		dragOriginListId.current = null;
	};

	// Cross-list preview. Relocating the card in the cache mid-drag is what makes
	// the gap open under the cursor; onDragEnd then persists from that state.
	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over || active.data.current?.type !== "task") return;

		const activeTaskId = String(active.id);
		const currentListId = findListIdByTaskId(project, activeTaskId);
		const overListId = resolveListId(over.data.current);

		if (!overListId || !currentListId || overListId === currentListId) return;

		const destination = lists.find((list) => list.id === overListId);

		if (!destination) return;

		const siblings = destination.tasks.filter(
			(task) => task.id !== activeTaskId,
		);

		const overIndex =
			over.data.current?.type === "task"
				? siblings.findIndex((task) => task.id === String(over.id))
				: -1;

		const insertIndex = overIndex === -1 ? siblings.length : overIndex;

		previewTaskMove(
			activeTaskId,
			overListId,
			calculatePosition(
				siblings[insertIndex - 1]?.position,
				siblings[insertIndex]?.position,
			),
		);
	};

	const handleListDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return;

		const overListId = resolveListId(over.data.current);
		const activeListId = String(active.id);

		if (!overListId || overListId === activeListId) return;

		const oldIndex = lists.findIndex((list) => list.id === activeListId);
		const newIndex = lists.findIndex((list) => list.id === overListId);

		if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

		const reordered = arrayMove(lists, oldIndex, newIndex);
		const { prev, next } = getNeighbourPositions(reordered, newIndex);

		moveList({
			listId: activeListId,
			position: calculatePosition(prev, next),
		}).catch(() => undefined);
	};

	const handleTaskDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return;

		const activeTaskId = String(active.id);

		// After handleDragOver the card may already live in the target list, so
		// read its list from the cache rather than from the drag payload.
		const destinationListId = findListIdByTaskId(project, activeTaskId);

		if (!destinationListId) return;

		const destination = lists.find((list) => list.id === destinationListId);

		if (!destination) return;

		const ordered = destination.tasks;
		const oldIndex = ordered.findIndex((task) => task.id === activeTaskId);

		if (oldIndex === -1) return;

		const overIsTaskHere =
			over.data.current?.type === "task" &&
			resolveListId(over.data.current) === destinationListId;

		const newIndex = overIsTaskHere
			? ordered.findIndex((task) => task.id === String(over.id))
			: ordered.length - 1;

		if (newIndex === -1) return;

		const isSameList = dragOriginListId.current === destinationListId;

		// Under a sort, a drop height inside the same list means nothing — the
		// comparator would immediately re-place the card. Cross-list still counts.
		if (taskSort !== "manual" && isSameList) return;

		// Same list, same slot — nothing to persist.
		if (isSameList && oldIndex === newIndex) return;

		let position: number;

		if (taskSort === "manual") {
			const reordered = arrayMove(ordered, oldIndex, newIndex);
			const { prev, next } = getNeighbourPositions(reordered, newIndex);
			position = calculatePosition(prev, next);
		} else {
			// Sorted view: append to the end so the card sits at the bottom of its
			// new list once the user switches back to Manual.
			const others = ordered.filter((task) => task.id !== activeTaskId);
			const last = others.reduce(
				(max, task) => Math.max(max, task.position),
				Number.NEGATIVE_INFINITY,
			);

			position = calculatePosition(
				others.length > 0 ? last : undefined,
				undefined,
			);
		}

		moveTask({
			taskId: activeTaskId,
			destinationListId,
			position,
		}).catch(() => undefined);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const type = event.active.data.current?.type;

		// Handlers read dragOriginListId, so clear only after they have run.
		if (type === "list") {
			handleListDragEnd(event);
		} else if (type === "task") {
			handleTaskDragEnd(event);
		}

		clearActive();
	};

	const isItemDragging = Boolean(activeList || activeTask);

	const activeTaskIsDone = activeTask
		? lists.find((list) => list.tasks.some((task) => task.id === activeTask.id))
				?.type === "done"
		: false;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			onDragCancel={clearActive}
		>
			<div
				ref={ref}
				{...dragHandlers}
				className={cn(
					"board-scrollbar flex h-full snap-x snap-mandatory scroll-smooth items-start gap-4 overflow-x-auto overflow-y-hidden pb-4 sm:snap-none sm:cursor-grab",
					isDragging && "sm:cursor-grabbing select-none scroll-auto",
					// Scroll snapping fights touch dragging on mobile.
					isItemDragging && "snap-none",
				)}
			>
				<SortableContext
					items={lists.map((list) => list.id)}
					strategy={horizontalListSortingStrategy}
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
				</SortableContext>

				{canManageLists && <CreateListButton />}
			</div>

			{/* Portaled to <body>, so the dragged item is not clipped by the board's
			    horizontal scroller or a list's vertical one. */}
			<DragOverlay>
				{activeList && (
					<div className="w-72 rounded-xl border bg-card p-3 shadow-lg">
						<p className="truncate text-sm font-semibold">{activeList.name}</p>

						<p className="mt-1 text-xs text-muted-foreground">
							{activeList.tasks.length}{" "}
							{activeList.tasks.length === 1 ? "card" : "cards"}
						</p>
					</div>
				)}

				{activeTask && (
					<div className="w-full rotate-2 opacity-90 shadow-lg sm:w-64">
						{/* Same isDone as the original, so the card does not change
						    colour halfway through a drag into or out of Done. */}
						<TaskCard task={activeTask} isDone={activeTaskIsDone} />
					</div>
				)}
			</DragOverlay>

			{canManageLists && (
				<CreateListDialog
					workspaceSlug={workspaceSlug}
					projectSlug={projectSlug}
				/>
			)}

			<TaskDetailsDialog
				task={openTask}
				members={project.members}
				listName={openListEntry?.list.name ?? ""}
				workspaceSlug={workspaceSlug}
				projectSlug={projectSlug}
			/>
		</DndContext>
	);
}
