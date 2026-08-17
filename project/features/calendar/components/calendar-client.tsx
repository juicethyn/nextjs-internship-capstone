"use client";

import { TriangleAlert } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CALENDAR_SURFACE } from "@/features/calendar/constants";
import { useCalendarDeadlines } from "@/features/calendar/hooks/use-calendar-deadlines";
import {
	filterDeadlines,
	getUpcomingDeadlines,
	toCalendarEvent,
} from "@/features/calendar/lib/calendar-utils";
import { useCalendarUIStore } from "@/features/calendar/store";
import type { CalendarDeadline } from "@/features/calendar/types";
import { useProjectUIStore } from "@/features/projects/store";
import { cn } from "@/lib/utils";
import { CalendarTaskDialog } from "./calendar-task-dialog";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarView } from "./calendar-view";
import { UpcomingDeadlines } from "./upcoming-deadlines";

const EMPTY_DEADLINES: never[] = [];

const EMPTY_PROJECTS: never[] = [];

type CalendarClientProps = {
	workspaceSlug: string;
};

export function CalendarClient({ workspaceSlug }: CalendarClientProps) {
	const priority = useCalendarUIStore((state) => state.priority);
	const projectId = useCalendarUIStore((state) => state.projectId);
	const anchorDate = useCalendarUIStore((state) => state.anchorDate);
	const setAnchorDate = useCalendarUIStore((state) => state.setAnchorDate);
	const setOpenTaskProjectSlug = useCalendarUIStore(
		(state) => state.setOpenTaskProjectSlug,
	);

	const openTaskDetails = useProjectUIStore((state) => state.openTaskDetails);

	const { data, isLoading, isError } = useCalendarDeadlines({ workspaceSlug });

	const deadlines = data?.deadlines ?? EMPTY_DEADLINES;

	const projects = data?.projects ?? EMPTY_PROJECTS;

	const filtered = useMemo(
		() => filterDeadlines(deadlines, priority, projectId),
		[deadlines, priority, projectId],
	);

	const events = useMemo(() => filtered.map(toCalendarEvent), [filtered]);

	const upcoming = useMemo(
		() => getUpcomingDeadlines(filtered, anchorDate),
		[filtered, anchorDate],
	);

	const openTask = useCallback(
		(deadline: CalendarDeadline) => {
			setOpenTaskProjectSlug(deadline.projectSlug);
			openTaskDetails(deadline.id);
		},
		[setOpenTaskProjectSlug, openTaskDetails],
	);

	return (
		<div className="flex flex-col lg:h-full lg:min-h-0 lg:flex-row">
			<div className="flex flex-col gap-5 p-6 lg:min-w-0 lg:flex-1 lg:overflow-auto">
				<CalendarToolbar projects={projects} />

				{isError ? (
					<div
						className={cn(
							"flex flex-col items-center justify-center gap-3 rounded-xl border bg-card text-center",
							CALENDAR_SURFACE,
						)}
					>
						<TriangleAlert className="size-8 text-muted-foreground" />

						<div className="space-y-1">
							<p className="font-medium">Calendar unavailable</p>

							<p className="text-sm text-muted-foreground">
								We couldn&apos;t load your task deadlines.
							</p>
						</div>
					</div>
				) : isLoading ? (
					<Skeleton className={cn("rounded-xl", CALENDAR_SURFACE)} />
				) : (
					<CalendarView events={events} onSelectEvent={openTask} />
				)}
			</div>

			<UpcomingDeadlines
				deadlines={upcoming}
				anchorDate={anchorDate}
				isLoading={isLoading}
				onSelect={openTask}
				onClearAnchor={() => setAnchorDate(null)}
			/>

			<CalendarTaskDialog workspaceSlug={workspaceSlug} />
		</div>
	);
}
