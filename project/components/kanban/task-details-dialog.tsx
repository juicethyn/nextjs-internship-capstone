"use client";

import { Flag, Tag, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTaskLabels } from "@/hooks/use-task-labels";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
import { type TaskPriority, taskPriorities } from "@/types/task";
import { LabelBadge } from "../labels/label-badge";
import { LabelToggle } from "../labels/label-toggle";
import { OptionalTag } from "../optional-tag";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PRIORITY_ICON_STYLES, PRIORITY_LABELS } from "./priority-badge";
import { RichTextEditor } from "./rich-text-editor";

type KanbanTask = ProjectDetail["lists"][number]["tasks"][number];
type ProjectMember = ProjectDetail["members"][number];

type TaskDetailsDialogProps = {
	task: KanbanTask | null;
	members: ProjectMember[];
	listName: string;
	workspaceSlug: string;
	projectSlug: string;
};

function memberName(member: ProjectMember) {
	return `${member.user.firstName} ${member.user.lastName}`.trim();
}

function initials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function TaskDetailsDialog({
	task,
	members,
	listName,
	workspaceSlug,
	projectSlug,
}: TaskDetailsDialogProps) {
	const openTaskId = useUIStore((state) => state.openTaskId);
	const closeTaskDetails = useUIStore((state) => state.closeTaskDetails);

	const isOpen = Boolean(task) && openTaskId === task?.id;

	const { updateTask, deleteTask, setTaskLabels, isUpdating, isDeleting } =
		useTasks({
			workspaceSlug,
			projectSlug,
		});

	const { taskLabels } = useTaskLabels({
		workspaceSlug,
		projectSlug,
		enabled: isOpen,
	});

	const [title, setTitle] = useState("");
	const [assigneeId, setAssigneeId] = useState<string | null>(null);
	const [priority, setPriority] = useState<TaskPriority>("none");
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [description, setDescription] = useState("");
	const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [assigneeOpen, setAssigneeOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);

	const resetFromTask = () => {
		if (!task) return;

		setTitle(task.title);
		setAssigneeId(task.assigneeId ?? null);
		setPriority((task.priority as TaskPriority) ?? "none");
		setStartDate(task.startDate ?? null);
		setDueDate(task.dueDate ?? null);
		setDescription(task.description ?? "");
		setSelectedLabelIds(
			(task.taskLabels ?? []).map(({ taskLabel }) => taskLabel.id),
		);
	};

	useEffect(resetFromTask, [task]);

	if (!task) return null;

	const assignee = members.find((member) => member.userId === assigneeId);

	const originalLabelIds = (task.taskLabels ?? []).map(
		({ taskLabel }) => taskLabel.id,
	);

	const toggleLabel = (labelId: string) =>
		setSelectedLabelIds((current) =>
			current.includes(labelId)
				? current.filter((id) => id !== labelId)
				: [...current, labelId],
		);

	const handleSave = async () => {
		const trimmed = title.trim();

		if (trimmed === "") return;

		const result = await updateTask({
			taskId: task.id,
			data: {
				title: trimmed,
				description,
				assigneeId,
				priority,
				startDate,
				dueDate,
			},
		}).catch(() => null);

		if (!result?.success) return;

		const added = selectedLabelIds.filter(
			(id) => !originalLabelIds.includes(id),
		);
		const removed = originalLabelIds.filter(
			(id) => !selectedLabelIds.includes(id),
		);

		if (added.length > 0 || removed.length > 0) {
			await setTaskLabels({
				taskId: task.id,
				added,
				removed,
				// Full label rows so the optimistic write can render real badges.
				labels: taskLabels.filter((label) =>
					selectedLabelIds.includes(label.id),
				),
			}).catch(() => undefined);
		}

		closeTaskDetails();
	};

	const handleDiscard = () => {
		resetFromTask();
		closeTaskDetails();
	};

	const selectedLabels = taskLabels.filter((label) =>
		selectedLabelIds.includes(label.id),
	);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) handleDiscard();
			}}
		>
			<DialogContent className="flex max-h-[85vh] min-w-0 flex-col gap-0 p-0 sm:max-w-xl">
				<DialogHeader className="shrink-0 border-b px-4 py-3">
					<DialogTitle className="text-base">Task Details</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						Update this task's details in {listName}.
					</DialogDescription>
				</DialogHeader>

				<div className="board-scrollbar min-h-0 flex-1 overflow-y-auto">
					<div className="min-w-0 space-y-4 px-4 py-4">
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Task title"
							aria-label="Task title"
							maxLength={200}
							className="h-10 text-base font-medium md:text-base"
						/>

						<div className="flex flex-wrap items-center gap-2">
							<Popover modal open={assigneeOpen} onOpenChange={setAssigneeOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" size="sm" className="gap-1.5">
										{assignee ? (
											<>
												<Avatar className="size-4">
													{assignee.user.imageUrl && (
														<AvatarImage
															src={assignee.user.imageUrl}
															alt={memberName(assignee)}
														/>
													)}

													<AvatarFallback className="text-[8px]">
														{initials(
															assignee.user.firstName,
															assignee.user.lastName,
														)}
													</AvatarFallback>
												</Avatar>
												<span className="max-w-32 truncate">
													{memberName(assignee)}
												</span>
											</>
										) : (
											<>
												<UserRound className="size-4 text-muted-foreground" />
												Unassigned
											</>
										)}
									</Button>
								</PopoverTrigger>

								<PopoverContent align="start" className="w-64 p-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setAssigneeId(null);
											setAssigneeOpen(false);
										}}
										className="w-full justify-start gap-2 font-normal"
									>
										<UserRound className="size-4 text-muted-foreground" />
										Unassigned
									</Button>

									{members.map((member) => (
										<Button
											key={member.userId}
											variant="ghost"
											size="sm"
											onClick={() => {
												setAssigneeId(member.userId);
												setAssigneeOpen(false);
											}}
											className={cn(
												"w-full justify-start gap-2 font-normal",
												member.userId === assigneeId && "bg-muted",
											)}
										>
											<Avatar className="size-5">
												{member.user.imageUrl && (
													<AvatarImage
														src={member.user.imageUrl}
														alt={memberName(member)}
													/>
												)}

												<AvatarFallback className="text-[9px]">
													{initials(
														member.user.firstName,
														member.user.lastName,
													)}
												</AvatarFallback>
											</Avatar>

											<span className="truncate">{memberName(member)}</span>
										</Button>
									))}
								</PopoverContent>
							</Popover>

							<Popover modal open={priorityOpen} onOpenChange={setPriorityOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" size="sm" className="gap-1.5">
										<Flag
											className={cn("size-4", PRIORITY_ICON_STYLES[priority])}
										/>
										{PRIORITY_LABELS[priority]}
									</Button>
								</PopoverTrigger>

								<PopoverContent align="start" className="w-40 p-1">
									{taskPriorities.map((value) => (
										<Button
											key={value}
											variant="ghost"
											size="sm"
											onClick={() => {
												setPriority(value);
												setPriorityOpen(false);
											}}
											className={cn(
												"w-full justify-start gap-2 font-normal",
												value === priority && "bg-muted",
											)}
										>
											<Flag
												className={cn("size-4", PRIORITY_ICON_STYLES[value])}
											/>
											{PRIORITY_LABELS[value]}
										</Button>
									))}
								</PopoverContent>
							</Popover>

							<Popover modal>
								<PopoverTrigger asChild>
									<Button variant="outline" size="sm" className="gap-1.5">
										<Tag className="size-4 text-muted-foreground" />
										{selectedLabelIds.length > 0
											? `${selectedLabelIds.length} label${selectedLabelIds.length === 1 ? "" : "s"}`
											: "Labels"}
									</Button>
								</PopoverTrigger>

								<PopoverContent
									align="start"
									className="w-[calc(100vw-2rem)] p-3 sm:w-80"
								>
									{taskLabels.length > 0 ? (
										<div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1">
											{taskLabels.map((label) => (
												<LabelToggle
													key={label.id}
													name={label.name}
													color={label.color}
													selected={selectedLabelIds.includes(label.id)}
													onToggle={() => toggleLabel(label.id)}
												/>
											))}
										</div>
									) : (
										<p className="text-xs text-muted-foreground">
											This project has no task labels yet.
										</p>
									)}
								</PopoverContent>
							</Popover>
						</div>

						{selectedLabels.length > 0 && (
							<div className="min-w-0 space-y-1.5">
								<Label className="text-xs text-muted-foreground">Labels</Label>

								<div className="flex min-w-0 flex-wrap items-center gap-1.5">
									{selectedLabels.map((label) => (
										<LabelBadge
											key={label.id}
											name={label.name}
											color={label.color}
										/>
									))}
								</div>
							</div>
						)}

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="min-w-0 space-y-1.5">
								<Label
									htmlFor="task-start-date"
									className="text-xs text-muted-foreground"
								>
									Start date
									<OptionalTag />
								</Label>

								<DatePicker
									id="task-start-date"
									value={startDate}
									onChange={(date) => setStartDate(date ?? null)}
									placeholder="Not set"
								/>
							</div>

							<div className="min-w-0 space-y-1.5">
								<Label
									htmlFor="task-due-date"
									className="text-xs text-muted-foreground"
								>
									Due date
									<OptionalTag />
								</Label>

								<DatePicker
									id="task-due-date"
									value={dueDate}
									onChange={(date) => setDueDate(date ?? null)}
									placeholder="Not set"
								/>
							</div>
						</div>

						<div className="min-w-0 space-y-1.5">
							<Label className="text-xs text-muted-foreground">
								Description
								<OptionalTag />
							</Label>

							<RichTextEditor content={description} onChange={setDescription} />
						</div>
					</div>
				</div>

				<DialogFooter className="m-0 shrink-0 rounded-b-xl border-t px-4 py-3 sm:justify-between">
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

					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
						<Button
							type="button"
							variant="outline"
							onClick={handleDiscard}
							className="w-full sm:w-auto"
						>
							Discard
						</Button>

						<Button
							type="button"
							disabled={isUpdating || title.trim() === ""}
							onClick={handleSave}
							className="w-full sm:w-auto"
						>
							{isUpdating ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent className="min-w-0 sm:max-w-md">
					<AlertDialogHeader className="min-w-0">
						<AlertDialogTitle>Delete this card?</AlertDialogTitle>

						<AlertDialogDescription className="min-w-0">
							<span className="inline-block max-w-56 truncate align-bottom font-medium sm:max-w-[20rem]">
								"{task.title}"
							</span>{" "}
							will be permanently deleted. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isDeleting}
							onClick={async (event) => {
								event.preventDefault();

								const result = await deleteTask(task.id).catch(() => null);

								if (result?.success) {
									setConfirmDelete(false);
									closeTaskDetails();
								}
							}}
						>
							{isDeleting ? "Deleting..." : "Delete card"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
