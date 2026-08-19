"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectDetail } from "@/features/projects/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";

type KanbanTask = ProjectDetail["lists"][number]["tasks"][number];

type SortableTaskCardProps = {
	task: KanbanTask;
	listId: string;
	disabled?: boolean;
	isDone?: boolean;
};

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
			className={cn("touch-manipulation", isDragging && "opacity-40")}
		>
			<TaskCard task={task} isDone={isDone} />
		</div>
	);
}
