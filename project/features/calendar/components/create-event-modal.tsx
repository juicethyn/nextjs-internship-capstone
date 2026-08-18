"use client";

import { ChevronDown, FolderKanban, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { OptionalTag } from "@/components/shared/optional-tag";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_LABELS } from "@/features/calendar/constants";
import { useEvents } from "@/features/calendar/hooks/use-events";
import type { CalendarEvent } from "@/features/calendar/types";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { type EventType, eventTypes } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { EVENT_DESCRIPTION_MAX_LENGTH } from "@/lib/validations/event";

const TRIGGER_STYLES = "h-9 w-full justify-start gap-2 px-3 font-normal";

type CreateEventModalProps = {
	workspaceSlug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	event?: CalendarEvent | null;
};

export function CreateEventModal({
	workspaceSlug,
	open,
	onOpenChange,
	event = null,
}: CreateEventModalProps) {
	const isEditing = Boolean(event);

	const [projectSlug, setProjectSlug] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [eventType, setEventType] = useState<EventType>("meeting");
	const [allDay, setAllDay] = useState(false);
	const [startAt, setStartAt] = useState<Date | null>(null);
	const [endAt, setEndAt] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { projects } = useProjects({ workspaceSlug });

	const selectableProjects = projects.filter((project) => !project.isArchived);

	const { createEvent, isCreating, updateEvent, isUpdating } = useEvents({
		workspaceSlug,
	});

	const isSaving = isCreating || isUpdating;

	useEffect(() => {
		if (!open) return;

		setError(null);

		if (event) {
			setProjectSlug(event.projectSlug);
			setTitle(event.title);
			setDescription(event.description ?? "");
			setEventType(event.eventType);
			setAllDay(event.allDay);
			setStartAt(event.startAt);
			setEndAt(event.endAt);
			return;
		}

		setProjectSlug(null);
		setTitle("");
		setDescription("");
		setEventType("meeting");
		setAllDay(false);
		setStartAt(null);
		setEndAt(null);
	}, [open, event]);

	const activeProject = selectableProjects.find(
		(project) => project.slug === projectSlug,
	);

	const handleSubmit = async () => {
		setError(null);

		if (!projectSlug) return setError("Pick a project.");

		if (!title.trim()) return setError("Title is required.");

		if (!startAt) return setError("Start date is required.");

		const start = allDay
			? new Date(
					startAt.getFullYear(),
					startAt.getMonth(),
					startAt.getDate(),
					0,
					0,
				)
			: startAt;

		const resolvedEnd = endAt ?? startAt;

		const end = allDay
			? new Date(
					resolvedEnd.getFullYear(),
					resolvedEnd.getMonth(),
					resolvedEnd.getDate(),
					23,
					59,
				)
			: resolvedEnd;

		if (end < start) {
			return setError("End must be on or after the start.");
		}

		const payload = {
			title: title.trim(),
			description: description.trim() || null,
			eventType,
			allDay,
			startAt: start,
			endAt: end,
		};

		try {
			if (event) {
				await updateEvent({ projectSlug, eventId: event.id, data: payload });
			} else {
				await createEvent({ projectSlug, data: payload });
			}

			onOpenChange(false);
		} catch {
			// useEvents surfaces the failure as a toast.
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 border-b px-5 py-4 sm:px-6">
					<DialogTitle className="text-base">
						{isEditing ? "Edit Event" : "Create Event"}
					</DialogTitle>

					<DialogDescription className="text-xs">
						{isEditing
							? "Update the details of this event."
							: "Schedule a meeting or session on the calendar."}
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
					<div className="space-y-2">
						<Label htmlFor="event-project">Project</Label>

						{isEditing && event ? (
							<div className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-muted/50 px-3">
								<WorkspaceAvatar
									name={event.projectName}
									color={event.projectColor}
									size="xs"
								/>

								<span className="truncate text-sm">{event.projectName}</span>
							</div>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										id="event-project"
										variant="outline"
										className={TRIGGER_STYLES}
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

										<span
											className={cn(
												"truncate",
												!activeProject && "text-muted-foreground",
											)}
										>
											{activeProject ? activeProject.name : "Select project"}
										</span>

										<ChevronDown className="ml-auto text-muted-foreground" />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="start"
									className="w-(--radix-dropdown-menu-trigger-width)"
								>
									<DropdownMenuRadioGroup
										value={projectSlug ?? ""}
										onValueChange={setProjectSlug}
									>
										{selectableProjects.map((project) => (
											<DropdownMenuRadioItem
												key={project.id}
												value={project.slug}
											>
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
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="event-title">Title</Label>

						<Input
							id="event-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Sprint planning"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="event-description">
							Description <OptionalTag />
						</Label>

						<Textarea
							id="event-description"
							value={description}
							maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Agenda, links, or anything worth noting."
							className="max-h-40 min-h-24 w-full overflow-y-auto wrap-anywhere"
						/>

						<div className="flex items-start justify-end gap-2">
							<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
								{description.length}/{EVENT_DESCRIPTION_MAX_LENGTH}
							</span>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="event-type">Event Type</Label>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									id="event-type"
									variant="outline"
									className={TRIGGER_STYLES}
								>
									<Tag className="text-muted-foreground" />

									<span className="truncate">
										{EVENT_TYPE_LABELS[eventType]}
									</span>

									<ChevronDown className="ml-auto text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width)"
							>
								<DropdownMenuRadioGroup
									value={eventType}
									onValueChange={(value) => setEventType(value as EventType)}
								>
									{eventTypes.map((type) => (
										<DropdownMenuRadioItem key={type} value={type}>
											{EVENT_TYPE_LABELS[type]}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="event-all-day"
							checked={allDay}
							onCheckedChange={(checked) => setAllDay(checked === true)}
						/>

						<Label htmlFor="event-all-day" className="font-normal">
							All day
						</Label>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="event-start">Start</Label>

							<DateTimePicker
								id="event-start"
								value={startAt}
								onChange={setStartAt}
								disableTime={allDay}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="event-end">
								End <OptionalTag />
							</Label>

							<DateTimePicker
								id="event-end"
								value={endAt}
								onChange={setEndAt}
								disableTime={allDay}
								placeholder="Same day"
							/>
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter className="m-0 shrink-0 border-t px-5 py-4 sm:px-6">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>

					<Button onClick={handleSubmit} disabled={isSaving}>
						{isSaving
							? isEditing
								? "Saving…"
								: "Creating…"
							: isEditing
								? "Save Changes"
								: "Create Event"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
