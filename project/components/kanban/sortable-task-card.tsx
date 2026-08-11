"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/types/projects";
import { TaskCard } from "./task-card";

type KanbanTask = ProjectDetail["lists"][number]["tasks"][number];

type SortableTaskCardProps = {
	task: KanbanTask;
	listId: string;
	disabled?: boolean;
	isDone?: boolean;
};

// Thin wrapper so TaskCard stays presentational — DragOverlay renders a second
// copy of it, and that copy must not register itself as a sortable node.
export function SortableTaskCard({
	task,
	listId,
	disabled = false,
	isDone = false,
}: SortableTaskCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		disabled,
		data: { type: "task", listId, task },
	});

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			{...attributes}
			{...listeners}
			// touch-manipulation, not touch-none: cards fill the list body, so
			// blocking touch gestures here would kill scrolling in a long list.
			// The TouchSensor's hold delay is what separates a drag from a swipe.
			className={cn("touch-manipulation", isDragging && "opacity-40")}
		>
			<TaskCard task={task} isDone={isDone} />
		</div>
	);
}
