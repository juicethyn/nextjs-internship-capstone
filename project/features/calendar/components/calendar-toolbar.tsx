"use client";

import { format } from "date-fns";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Flag,
	FolderKanban,
	Plus,
} from "lucide-react";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendarUIStore } from "@/features/calendar/store";
import type {
	CalendarProject,
	CalendarViewMode,
	PriorityFilter,
} from "@/features/calendar/types";
import { PRIORITY_ICON_STYLES } from "@/features/projects/kanban/components/priority-badge";
import { cn } from "@/lib/utils";
import { DeadlineWeekView } from "./deadline-week-view";

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
	{ value: "all", label: "All Priorities" },
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
];

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
	{ value: "month", label: "Month" },
	{ value: "week", label: "Week" },
];

const TRIGGER_STYLES = "h-9 gap-2 px-3 text-[13px]";

const ACTIVE_TRIGGER_STYLES =
	"border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary";

const segmentedItem = (active: boolean) =>
	cn(
		"h-9 rounded-none px-3 text-xs font-medium",
		active
			? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary"
			: "text-muted-foreground",
	);

function PriorityDot({ priority }: { priority: PriorityFilter }) {
	if (priority === "all") return null;

	return (
		<span
			aria-hidden="true"
			className={cn(
				"size-2 shrink-0 rounded-full bg-current",
				PRIORITY_ICON_STYLES[priority],
			)}
		/>
	);
}

type CalendarToolbarProps = {
	projects: CalendarProject[];
	onCreateEvent: () => void;
};

export function CalendarToolbar({
	projects,
	onCreateEvent,
}: CalendarToolbarProps) {
	const date = useCalendarUIStore((state) => state.date);
	const view = useCalendarUIStore((state) => state.view);
	const priority = useCalendarUIStore((state) => state.priority);
	const projectId = useCalendarUIStore((state) => state.projectId);
	const setView = useCalendarUIStore((state) => state.setView);
	const setPriority = useCalendarUIStore((state) => state.setPriority);
	const setProjectId = useCalendarUIStore((state) => state.setProjectId);
	const goToToday = useCalendarUIStore((state) => state.goToToday);
	const shift = useCalendarUIStore((state) => state.shift);

	const activeProject = projects.find((project) => project.id === projectId);

	const activePriority = PRIORITY_OPTIONS.find(
		(option) => option.value === priority,
	);

	const label =
		view === "month" ? format(date, "MMMM yyyy") : DeadlineWeekView.title(date);

	return (
		<div className="flex shrink-0 flex-col gap-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-0.5">
					<h1 className="text-2xl font-bold lg:text-3xl">Calendar</h1>

					<p className="text-sm text-muted-foreground">
						Task deadlines and schedule overview
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									TRIGGER_STYLES,
									priority !== "all" && ACTIVE_TRIGGER_STYLES,
								)}
							>
								{priority === "all" ? (
									<Flag className="text-muted-foreground" />
								) : (
									<PriorityDot priority={priority} />
								)}

								{activePriority?.label}

								<ChevronDown className="text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuRadioGroup
								value={priority}
								onValueChange={(value) => setPriority(value as PriorityFilter)}
							>
								{PRIORITY_OPTIONS.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
									>
										<PriorityDot priority={option.value} />

										<span className="truncate">{option.label}</span>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									TRIGGER_STYLES,
									activeProject && ACTIVE_TRIGGER_STYLES,
								)}
							>
								{activeProject ? (
									<WorkspaceAvatar
										name={activeProject.name}
										color={activeProject.color}
										size="xs"
									/>
								) : (
									<FolderKanban className="text-muted-foreground" />
								)}

								{activeProject ? activeProject.name : "All Projects"}

								<ChevronDown className="text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuRadioGroup
								value={projectId}
								onValueChange={setProjectId}
							>
								<DropdownMenuRadioItem value="all">
									All Projects
								</DropdownMenuRadioItem>

								{projects.map((project) => (
									<DropdownMenuRadioItem key={project.id} value={project.id}>
										<WorkspaceAvatar
											name={project.name}
											color={project.color}
											size="xs"
										/>

										<span className="truncate">{project.name}</span>
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						onClick={onCreateEvent}
						className="h-9 gap-2 px-4 text-[13px] font-semibold"
					>
						<Plus />
						Create Event
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Button
					variant="outline"
					size="icon"
					onClick={() => shift(-1)}
					aria-label="Previous"
				>
					<ChevronLeft />
				</Button>

				<h2 className="min-w-40 text-center text-base font-semibold">
					{label}
				</h2>

				<Button
					variant="outline"
					size="icon"
					onClick={() => shift(1)}
					aria-label="Next"
				>
					<ChevronRight />
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={goToToday}
					className="ml-1 h-8"
				>
					Today
				</Button>

				<div className="flex items-center divide-x divide-border overflow-hidden rounded-md border sm:ml-auto">
					{VIEW_OPTIONS.map((option) => (
						<Button
							key={option.value}
							variant="ghost"
							onClick={() => setView(option.value)}
							className={segmentedItem(view === option.value)}
						>
							{option.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
