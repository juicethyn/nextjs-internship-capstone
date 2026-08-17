"use client";

import type { JSONContent } from "@tiptap/react";
import { Flag, Tag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { OptionalTag } from "@/components/shared/optional-tag";
import { WorkspaceAvatar } from "@/components/shared/workspace-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjectOptions } from "@/features/dashboard/hooks/use-project-options";
import { LabelBadge } from "@/features/labels/components/label-badge";
import { LabelToggle } from "@/features/labels/components/label-toggle";
import { useTaskLabels } from "@/features/labels/hooks/use-task-labels";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
	PRIORITY_ICON_STYLES,
	PRIORITY_LABELS,
} from "@/features/projects/kanban/components/priority-badge";
import { RichTextEditor } from "@/features/projects/kanban/components/rich-text-editor";
import { useTasks } from "@/features/projects/kanban/hooks/use-tasks";
import { type TaskPriority, taskPriorities } from "@/lib/db/types";
import { getInitials, memberDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type CreateTaskModalProps = {
	workspaceSlug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateTaskModal({
	workspaceSlug,
	open,
	onOpenChange,
}: CreateTaskModalProps) {
	const [projectSlug, setProjectSlug] = useState<string | null>(null);
	const [listId, setListId] = useState<string>("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState<JSONContent | null>(null);
	const [priority, setPriority] = useState<TaskPriority>("none");
	const [assigneeId, setAssigneeId] = useState<string | null>(null);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
	const [assigneeOpen, setAssigneeOpen] = useState(false);
	const [priorityOpen, setPriorityOpen] = useState(false);

	const { projects } = useProjects({ workspaceSlug });

	const selectableProjects = projects.filter((project) => !project.isArchived);

	const { todoLists, members } = useProjectOptions({
		workspaceSlug,
		projectSlug,
	});

	const { taskLabels } = useTaskLabels({
		workspaceSlug,
		projectSlug: projectSlug ?? "",
		enabled: Boolean(projectSlug) && open,
	});

	const { createTask, isCreating, setTaskLabels } = useTasks({
		workspaceSlug,
		projectSlug: projectSlug ?? "",
	});

	useEffect(() => {
		if (todoLists.length === 0) return;

		setListId((current) =>
			todoLists.some((list) => list.id === current) ? current : todoLists[0].id,
		);
	}, [todoLists]);

	const resetForm = () => {
		setProjectSlug(null);
		setListId("");
		setTitle("");
		setDescription(null);
		setPriority("none");
		setAssigneeId(null);
		setStartDate(null);
		setDueDate(null);
		setSelectedLabelIds([]);
	};

	const handleProjectChange = (value: string) => {
		setProjectSlug(value);
		setListId("");
		setAssigneeId(null);
		setSelectedLabelIds([]);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) resetForm();

		onOpenChange(next);
	};

	const toggleLabel = (labelId: string) =>
		setSelectedLabelIds((current) =>
			current.includes(labelId)
				? current.filter((id) => id !== labelId)
				: [...current, labelId],
		);

	const assignee = members.find((member) => member.userId === assigneeId);

	const selectedLabels = taskLabels.filter((label) =>
		selectedLabelIds.includes(label.id),
	);

	const trimmedTitle = title.trim();
	const canSubmit =
		Boolean(projectSlug) && listId !== "" && trimmedTitle !== "";

	const handleSubmit = async () => {
		if (!canSubmit) return;

		const result = await createTask({
			listId,
			data: {
				title: trimmedTitle,
				description,
				assigneeId,
				priority,
				startDate,
				dueDate,
			},
		}).catch(() => null);

		if (!result?.success || !result.data) return;

		if (selectedLabelIds.length > 0) {
			await setTaskLabels({
				taskId: result.data.id,
				added: selectedLabelIds,
				removed: [],
				labels: selectedLabels,
			}).catch(() => undefined);
		}

		resetForm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[85vh] min-w-0 flex-col gap-0 p-0 sm:max-w-xl">
				<DialogHeader className="shrink-0 border-b px-4 py-3">
					<DialogTitle className="text-base">Create Task</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						Add a task to any project in this workspace.
					</DialogDescription>
				</DialogHeader>

				<div className="board-scrollbar min-w-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="min-w-0 space-y-1.5">
							<Label
								htmlFor="task-project"
								className="text-xs text-muted-foreground"
							>
								Project
							</Label>

							<Select
								value={projectSlug ?? undefined}
								onValueChange={handleProjectChange}
							>
								<SelectTrigger id="task-project" className="w-full">
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

						<div className="min-w-0 space-y-1.5">
							<Label
								htmlFor="task-list"
								className="text-xs text-muted-foreground"
							>
								List
							</Label>

							<Select
								value={listId || undefined}
								onValueChange={setListId}
								disabled={!projectSlug || todoLists.length === 0}
							>
								<SelectTrigger id="task-list" className="w-full">
									<SelectValue placeholder="Select list" />
								</SelectTrigger>

								<SelectContent>
									{todoLists.map((list) => (
										<SelectItem key={list.id} value={list.id}>
											{list.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

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
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5"
									disabled={!projectSlug}
								>
									{assignee ? (
										<>
											<Avatar className="size-4">
												{assignee.user.imageUrl && (
													<AvatarImage
														src={assignee.user.imageUrl}
														alt={memberDisplayName(assignee.user)}
													/>
												)}

												<AvatarFallback className="text-[8px]">
													{getInitials(
														assignee.user.firstName,
														assignee.user.lastName,
													)}
												</AvatarFallback>
											</Avatar>

											<span className="max-w-32 truncate">
												{memberDisplayName(assignee.user)}
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
													alt={memberDisplayName(member.user)}
												/>
											)}

											<AvatarFallback className="text-[9px]">
												{getInitials(
													member.user.firstName,
													member.user.lastName,
												)}
											</AvatarFallback>
										</Avatar>

										<span className="truncate">
											{memberDisplayName(member.user)}
										</span>
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
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5"
									disabled={!projectSlug}
								>
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
								htmlFor="create-task-start-date"
								className="text-xs text-muted-foreground"
							>
								Start date
								<OptionalTag />
							</Label>

							<DatePicker
								id="create-task-start-date"
								value={startDate}
								onChange={(date) => setStartDate(date ?? null)}
								placeholder="Not set"
							/>
						</div>

						<div className="min-w-0 space-y-1.5">
							<Label
								htmlFor="create-task-due-date"
								className="text-xs text-muted-foreground"
							>
								Due date
								<OptionalTag />
							</Label>

							<DatePicker
								id="create-task-due-date"
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

				<DialogFooter className="m-0 shrink-0 rounded-b-xl border-t px-4 py-3">
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>

						<Button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmit || isCreating}
							className="w-full sm:w-auto"
						>
							{isCreating ? "Creating..." : "Create Task"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
