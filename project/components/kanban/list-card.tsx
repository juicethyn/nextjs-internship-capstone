"use client";

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
	const tasks = [...list.tasks].sort((a, b) => a.position - b.position);
	const canDelete = list.type !== "done";

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
		<section className="group flex max-h-full w-full shrink-0 cursor-default snap-start flex-col rounded-xl border bg-card sm:w-72">
			<header className="flex shrink-0 items-center gap-2 border-b p-3">
				<GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />

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

			<div className="board-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
				{optimisticTasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task}
						isPending={task.id.startsWith("pending-")}
					/>
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
