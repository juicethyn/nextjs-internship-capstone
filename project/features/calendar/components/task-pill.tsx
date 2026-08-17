"use client";

import { isCompleted } from "@/features/calendar/lib/calendar-utils";
import type { CalendarDeadline } from "@/features/calendar/types";
import { PRIORITY_STYLES } from "@/features/projects/kanban/components/priority-badge";
import { cn } from "@/lib/utils";

type TaskPillProps = {
	deadline: CalendarDeadline;
	showProject?: boolean;
	onSelect?: (deadline: CalendarDeadline) => void;
};

export function TaskPill({
	deadline,
	showProject = false,
	onSelect,
}: TaskPillProps) {
	const done = isCompleted(deadline);

	const className = cn(
		"w-full overflow-hidden rounded border text-left transition-opacity hover:opacity-80",
		PRIORITY_STYLES[deadline.priority],
		showProject ? "px-2 py-1.5" : "px-1.5 py-0.5",
		done && "opacity-40 line-through",
	);

	const style = {
		borderLeftColor: deadline.projectColor,
		borderLeftWidth: 2,
	};

	const content = (
		<>
			<p
				className={cn(
					"truncate font-medium",
					showProject ? "text-[11px]" : "text-[10px]",
				)}
			>
				{deadline.title}
			</p>

			{showProject && (
				<p className="mt-0.5 truncate text-[10px] opacity-70">
					{deadline.projectName}
				</p>
			)}
		</>
	);

	if (!onSelect) {
		return (
			<div className={className} style={style}>
				{content}
			</div>
		);
	}

	return (
		<button
			type="button"
			className={className}
			style={style}
			onClick={(event) => {
				event.stopPropagation();
				onSelect(deadline);
			}}
		>
			{content}
		</button>
	);
}
