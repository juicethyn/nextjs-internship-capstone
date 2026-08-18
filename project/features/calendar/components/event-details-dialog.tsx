"use client";

import { CalendarRange, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EVENT_TYPE_LABELS } from "@/features/calendar/constants";
import { useEvents } from "@/features/calendar/hooks/use-events";
import { formatEventRange } from "@/features/calendar/lib/calendar-utils";
import type { CalendarEvent } from "@/features/calendar/types";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type EventDetailsDialogProps = {
	event: CalendarEvent | null;
	workspaceSlug: string;
	onOpenChange: (open: boolean) => void;
	onEdit: (event: CalendarEvent) => void;
};

export function EventDetailsDialog({
	event,
	workspaceSlug,
	onOpenChange,
	onEdit,
}: EventDetailsDialogProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);

	const { deleteEvent, isDeleting } = useEvents({ workspaceSlug });

	if (!event) return null;

	const createdBy = memberDisplayName(event.createdBy);

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 border-b px-5 py-4 sm:px-6">
					<DialogTitle className="pr-8 text-base wrap-anywhere">
						{event.title}
					</DialogTitle>

					<DialogDescription className="text-xs">
						Event details
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">
							{EVENT_TYPE_LABELS[event.eventType]}
						</Badge>

						<span className="flex min-w-0 items-center gap-1.5">
							<WorkspaceAvatar
								name={event.projectName}
								color={event.projectColor}
								size="xs"
							/>

							<span className="truncate text-sm text-muted-foreground">
								{event.projectName}
							</span>
						</span>
					</div>

					<div className="flex items-start gap-2 text-sm">
						<CalendarRange className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

						<span>{formatEventRange(event)}</span>
					</div>

					{event.description && (
						<p className="whitespace-pre-wrap text-sm text-muted-foreground wrap-anywhere">
							{event.description}
						</p>
					)}

					<div className="flex items-center gap-2 border-t pt-4">
						<Avatar className="size-7 shrink-0">
							{event.createdBy.imageUrl && (
								<AvatarImage src={event.createdBy.imageUrl} alt={createdBy} />
							)}

							<AvatarFallback className="text-[10px]">
								{getInitials(
									event.createdBy.firstName,
									event.createdBy.lastName,
								)}
							</AvatarFallback>
						</Avatar>

						<div className="min-w-0">
							<p className="text-[11px] text-muted-foreground">Created by</p>

							<p className="truncate text-sm font-medium">{createdBy}</p>
						</div>
					</div>
				</div>

				<DialogFooter className="m-0 shrink-0 border-t px-5 py-4 sm:px-6">
					{event.canManage ? (
						<>
							<Button
								type="button"
								variant="destructive"
								disabled={isDeleting}
								onClick={() => setConfirmDelete(true)}
								className="w-full gap-1.5 sm:w-auto"
							>
								<Trash2 />
								Delete
							</Button>

							<Button
								type="button"
								onClick={() => onEdit(event)}
								className="w-full gap-1.5 sm:w-auto"
							>
								<Pencil />
								Edit
							</Button>
						</>
					) : (
						<DialogClose asChild>
							<Button variant="outline" className="w-full sm:w-auto">
								Close
							</Button>
						</DialogClose>
					)}
				</DialogFooter>
			</DialogContent>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent className="min-w-0 sm:max-w-md">
					<AlertDialogHeader className="min-w-0">
						<AlertDialogTitle>Delete this event?</AlertDialogTitle>

						<AlertDialogDescription className="min-w-0">
							<span className="inline-block max-w-56 truncate align-bottom font-medium sm:max-w-[20rem]">
								"{event.title}"
							</span>{" "}
							will be permanently deleted. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isDeleting}
							onClick={async (clickEvent) => {
								clickEvent.preventDefault();

								try {
									await deleteEvent({
										projectSlug: event.projectSlug,
										eventId: event.id,
									});

									setConfirmDelete(false);
									onOpenChange(false);
								} catch {
									setConfirmDelete(false);
								}
							}}
						>
							{isDeleting ? "Deleting…" : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
