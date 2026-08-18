"use client";

import { TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CALENDAR_SURFACE } from "@/features/calendar/constants";
import { useCalendarDeadlines } from "@/features/calendar/hooks/use-calendar-deadlines";
import {
	filterDeadlines,
	getUpcomingItems,
	toEventItem,
	toTaskItem,
} from "@/features/calendar/lib/calendar-utils";
import { useCalendarUIStore } from "@/features/calendar/store";
import type { CalendarItem } from "@/features/calendar/types";
import { useProjectUIStore } from "@/features/projects/store";
import { cn } from "@/lib/utils";
import { CalendarTaskDialog } from "./calendar-task-dialog";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarView } from "./calendar-view";
import { CreateEventModal } from "./create-event-modal";
import { EventDetailsDialog } from "./event-details-dialog";
import { UpcomingPanel } from "./upcoming-panel";

const EMPTY_DEADLINES: never[] = [];

const EMPTY_EVENTS: never[] = [];

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

	const [createEventOpen, setCreateEventOpen] = useState(false);

	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

	const [editingEventId, setEditingEventId] = useState<string | null>(null);

	const { data, isLoading, isError } = useCalendarDeadlines({ workspaceSlug });

	const deadlines = data?.deadlines ?? EMPTY_DEADLINES;

	const events = data?.events ?? EMPTY_EVENTS;

	const projects = data?.projects ?? EMPTY_PROJECTS;

	const filtered = useMemo(
		() => filterDeadlines(deadlines, priority, projectId),
		[deadlines, priority, projectId],
	);

	const visibleEvents = useMemo(
		() =>
			projectId === "all"
				? events
				: events.filter((event) => event.projectId === projectId),
		[events, projectId],
	);

	const items = useMemo(
		() => [...filtered.map(toTaskItem), ...visibleEvents.map(toEventItem)],
		[filtered, visibleEvents],
	);

	const upcoming = useMemo(
		() => getUpcomingItems(items, anchorDate),
		[items, anchorDate],
	);

	const selectedEvent =
		events.find((candidate) => candidate.id === selectedEventId) ?? null;

	const editingEvent =
		events.find((candidate) => candidate.id === editingEventId) ?? null;

	const openItem = useCallback(
		(item: CalendarItem) => {
			if (item.kind === "event") {
				setSelectedEventId(item.event.id);
				return;
			}

			setOpenTaskProjectSlug(item.deadline.projectSlug);
			openTaskDetails(item.deadline.id);
		},
		[setOpenTaskProjectSlug, openTaskDetails],
	);

	return (
		<div className="flex flex-col lg:h-full lg:min-h-0 lg:flex-row">
			<div className="flex flex-col gap-5 p-6 lg:min-w-0 lg:flex-1 lg:overflow-auto">
				<CalendarToolbar
					projects={projects}
					onCreateEvent={() => setCreateEventOpen(true)}
				/>

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
					<CalendarView events={items} onSelectEvent={openItem} />
				)}
			</div>

			<UpcomingPanel
				items={upcoming}
				anchorDate={anchorDate}
				isLoading={isLoading}
				onSelect={openItem}
				onClearAnchor={() => setAnchorDate(null)}
			/>

			<CalendarTaskDialog workspaceSlug={workspaceSlug} />

			<CreateEventModal
				workspaceSlug={workspaceSlug}
				open={createEventOpen || Boolean(editingEvent)}
				event={editingEvent}
				onOpenChange={(next) => {
					if (next) return;

					setCreateEventOpen(false);
					setEditingEventId(null);
				}}
			/>

			<EventDetailsDialog
				event={editingEvent ? null : selectedEvent}
				workspaceSlug={workspaceSlug}
				onOpenChange={(next) => {
					if (!next) setSelectedEventId(null);
				}}
				onEdit={(target) => setEditingEventId(target.id)}
			/>
		</div>
	);
}
