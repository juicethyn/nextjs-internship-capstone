"use client";

import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
	startTransition,
	useEffect,
	useOptimistic,
	useRef,
	useState,
} from "react";
import { useLists } from "@/hooks/use-lists";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { LIST_TYPE_STYLES } from "@/lib/utils/list-styles";
import { sortTasks } from "@/lib/utils/task-sort";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
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
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { SortableTaskCard } from "./sortable-task-card";
import { TaskCard } from "./task-card";

type KanbanList = ProjectDetail["lists"][number];

type ListCardProps = {
	list: KanbanList;
	workspaceSlug: string;
	projectSlug: string;
	canManage: boolean;
};

export function ListCard({
	list,
	workspaceSlug,
	projectSlug,
	canManage,
}: ListCardProps) {
	const typeStyle = LIST_TYPE_STYLES[list.type];
	const canDelete = list.type !== "done";
	const isDone = list.type === "done";

	// View-only ordering. SortableContext below is fed this exact array, since
	// its items must match render order or drop targets land on the wrong card.
	const taskSort = useUIStore((state) => state.taskSort);
	const tasks = sortTasks(list.tasks, taskSort);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: list.id,
		disabled: !canManage,
		data: { type: "list", list },
	});

	// An empty list has no sortable children to collide with, so the body itself
	// has to be a drop target or cards could never be dropped into it.
	const { setNodeRef: setDroppableRef } = useDroppable({
		id: `list-body-${list.id}`,
		data: { type: "list-body", listId: list.id },
	});

	const { updateList, deleteList, isDeleting } = useLists({
		workspaceSlug,
		projectSlug,
	});

	const { createTask } = useTasks({ workspaceSlug, projectSlug });

	const [optimisticTasks, addOptimisticTask] = useOptimistic(
		tasks as { id: string; title: string; description?: string | null }[],
		(current, pending: { id: string; title: string }) => [
			...current,
			{ ...pending, description: null },
		],
	);

	const [isComposing, setIsComposing] = useState(false);
	const [draftTitle, setDraftTitle] = useState("");
	const composerRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isComposing) return;

		const frame = requestAnimationFrame(() => composerRef.current?.focus());

		return () => cancelAnimationFrame(frame);
	}, [isComposing]);

	const submitTask = () => {
		const trimmed = draftTitle.trim();

		if (trimmed === "") return;

		setDraftTitle("");
		setIsComposing(false);

		startTransition(async () => {
			addOptimisticTask({
				id: `pending-${crypto.randomUUID()}`,
				title: trimmed,
			});

			await createTask({
				listId: list.id,
				data: { title: trimmed, priority: "none" },
			}).catch(() => null);
		});
	};

	const cancelComposing = () => {
		setDraftTitle("");
		setIsComposing(false);
	};

	const [isEditing, setIsEditing] = useState(false);
	const [draftName, setDraftName] = useState(list.name);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isEditing) return;

		const frame = requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});

		return () => cancelAnimationFrame(frame);
	}, [isEditing]);

	const startEditing = () => {
		if (!canManage) return;

		setDraftName(list.name);
		setIsEditing(true);
	};

	const commitName = async () => {
		if (!isEditing) return;

		const trimmed = draftName.trim();

		setIsEditing(false);

		if (trimmed === "" || trimmed === list.name) {
			setDraftName(list.name);
			return;
		}

		await updateList({ listId: list.id, data: { name: trimmed } }).catch(
			() => undefined,
		);
	};

	const cancelEditing = () => {
		setDraftName(list.name);
		setIsEditing(false);
	};

	return (
		<section
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			{...attributes}
			className={cn(
				"group flex max-h-full w-full shrink-0 cursor-default snap-start flex-col rounded-xl border bg-card sm:w-72",
				isDragging && "opacity-40",
			)}
		>
			<header className="flex shrink-0 items-center gap-2 border-b p-3">
				{/* Listeners live on the handle only, so renaming and the dropdown
				    still work without starting a drag. */}
				<GripVertical
					{...(canManage ? listeners : {})}
					aria-label={canManage ? `Reorder ${list.name}` : undefined}
					className={cn(
						"size-4 shrink-0 text-muted-foreground",
						canManage
							? "cursor-grab touch-none active:cursor-grabbing"
							: "opacity-40",
					)}
				/>

				<span
					className={cn("size-2 shrink-0 rounded-full", typeStyle.accent)}
				/>

				{isEditing ? (
					<Input
						value={draftName}
						onChange={(event) => setDraftName(event.target.value)}
						onBlur={commitName}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								commitName();
							}

							if (event.key === "Escape") {
								event.preventDefault();
								cancelEditing();
							}
						}}
						ref={inputRef}
						aria-label={`Rename ${list.name}`}
						maxLength={100}
						className="h-7 min-w-0 flex-1 text-sm font-semibold"
					/>
				) : (
					<h2
						onDoubleClick={startEditing}
						title={canManage ? "Double-click to rename" : undefined}
						className={cn(
							"min-w-0 flex-1 truncate text-sm font-semibold",
							canManage && "cursor-text",
						)}
					>
						{list.name}
					</h2>
				)}

				<span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
					{tasks.length}
				</span>

				{canManage && canDelete && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label={`Options for ${list.name}`}
								className="text-muted-foreground"
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuItem
								variant="destructive"
								onSelect={() => setConfirmOpen(true)}
							>
								<Trash2 />
								Delete list
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</header>

			<div
				ref={setDroppableRef}
				className="board-scrollbar min-h-16 flex-1 space-y-2 overflow-y-auto p-3"
			>
				{/* Only real tasks go into the sortable set — the useOptimistic
				    placeholders have no persisted id for dnd-kit to track. */}
				<SortableContext
					items={tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.map((task) => (
						<SortableTaskCard
							key={task.id}
							task={task}
							listId={list.id}
							isDone={isDone}
						/>
					))}
				</SortableContext>

				{optimisticTasks
					.filter((task) => task.id.startsWith("pending-"))
					.map((task) => (
						<TaskCard key={task.id} task={task} isPending />
					))}

				{isComposing && (
					<div className="rounded-lg border border-l-4 bg-background p-2">
						<Input
							ref={composerRef}
							value={draftTitle}
							onChange={(event) => setDraftTitle(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									submitTask();
								}

								if (event.key === "Escape") {
									event.preventDefault();
									cancelComposing();
								}
							}}
							placeholder="Card title..."
							aria-label={`New card title in ${list.name}`}
							maxLength={200}
							className="h-8 text-sm"
						/>

						<div className="mt-2 flex items-center gap-2">
							<Button type="button" size="sm" onClick={submitTask}>
								Add
							</Button>

							<Button
								type="button"
								size="sm"
								variant="ghost"
								onClick={cancelComposing}
							>
								Cancel
							</Button>
						</div>
					</div>
				)}
			</div>

			{!isComposing && (
				<div className="shrink-0 px-3 pb-3">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setIsComposing(true)}
						className="w-full opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
					>
						<Plus />
						Create card
					</Button>
				</div>
			)}

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete "{list.name}"?</AlertDialogTitle>

						<AlertDialogDescription>
							{tasks.length > 0
								? `This permanently deletes the list and its ${tasks.length} ${
										tasks.length === 1 ? "task" : "tasks"
									}. This cannot be undone.`
								: "This permanently deletes the list. This cannot be undone."}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isDeleting}
							onClick={async (event) => {
								event.preventDefault();

								const result = await deleteList(list.id).catch(() => null);

								if (result?.success) {
									setConfirmOpen(false);
								}
							}}
						>
							{isDeleting ? "Deleting..." : "Delete list"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
