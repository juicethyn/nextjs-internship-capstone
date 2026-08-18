"use client";

import { useEffect, useState } from "react";
import { OptionalTag } from "@/components/shared/optional-tag";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEvents } from "@/features/calendar/hooks/use-events";
import { combineDateAndTime } from "@/features/calendar/lib/calendar-utils";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { type EventType, eventTypes } from "@/lib/db/types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
	meeting: "Meeting",
	planning: "Planning",
	review: "Review",
	presentation: "Presentation",
	discussion: "Discussion",
	other: "Other",
};

type CreateEventModalProps = {
	workspaceSlug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateEventModal({
	workspaceSlug,
	open,
	onOpenChange,
}: CreateEventModalProps) {
	const [projectSlug, setProjectSlug] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [eventType, setEventType] = useState<EventType>("meeting");
	const [allDay, setAllDay] = useState(false);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [startTime, setStartTime] = useState("09:00");
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [endTime, setEndTime] = useState("10:00");
	const [error, setError] = useState<string | null>(null);

	const { projects } = useProjects({ workspaceSlug });

	const selectableProjects = projects.filter((project) => !project.isArchived);

	const { createEvent, isCreating } = useEvents({ workspaceSlug });

	useEffect(() => {
		if (open) return;

		setProjectSlug(null);
		setTitle("");
		setDescription("");
		setEventType("meeting");
		setAllDay(false);
		setStartDate(null);
		setStartTime("09:00");
		setEndDate(null);
		setEndTime("10:00");
		setError(null);
	}, [open]);

	const handleSubmit = async () => {
		setError(null);

		if (!projectSlug) return setError("Pick a project.");

		if (!title.trim()) return setError("Title is required.");

		if (!startDate) return setError("Start date is required.");

		const resolvedEnd = endDate ?? startDate;

		const startAt = allDay
			? combineDateAndTime(startDate, "00:00")
			: combineDateAndTime(startDate, startTime);

		const endAt = allDay
			? combineDateAndTime(resolvedEnd, "23:59")
			: combineDateAndTime(resolvedEnd, endTime);

		if (endAt < startAt) {
			return setError("End must be on or after the start.");
		}

		try {
			await createEvent({
				projectSlug,
				data: {
					title: title.trim(),
					description: description.trim() || null,
					eventType,
					allDay,
					startAt,
					endAt,
				},
			});

			onOpenChange(false);
		} catch {
			// useEvents surfaces the failure as a toast.
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create event</DialogTitle>

					<DialogDescription>
						Schedule a meeting or session on the calendar.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="event-project">Project</Label>

						<Select
							value={projectSlug ?? ""}
							onValueChange={(value) => setProjectSlug(value)}
						>
							<SelectTrigger id="event-project" className="w-full">
								<SelectValue placeholder="Select project" />
							</SelectTrigger>

							<SelectContent>
								{selectableProjects.map((project) => (
									<SelectItem key={project.id} value={project.slug}>
										<WorkspaceAvatar
											name={project.name}
											color={project.color}
											size="xs"
										/>

										<span className="truncate">{project.name}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Agenda, links, or anything worth noting."
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="event-type">Type</Label>

						<Select
							value={eventType}
							onValueChange={(value) => setEventType(value as EventType)}
						>
							<SelectTrigger id="event-type" className="w-full">
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								{eventTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{EVENT_TYPE_LABELS[type]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
							<Label>Start</Label>

							<DatePicker
								value={startDate}
								onChange={(date) => setStartDate(date ?? null)}
							/>

							<Input
								type="time"
								value={startTime}
								disabled={allDay}
								onChange={(e) => setStartTime(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								End <OptionalTag />
							</Label>

							<DatePicker
								value={endDate}
								onChange={(date) => setEndDate(date ?? null)}
								placeholder="Same day"
							/>

							<Input
								type="time"
								value={endTime}
								disabled={allDay}
								onChange={(e) => setEndTime(e.target.value)}
							/>
						</div>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isCreating}
					>
						Cancel
					</Button>

					<Button onClick={handleSubmit} disabled={isCreating}>
						{isCreating ? "Creating…" : "Create Event"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
