"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { TaskComment } from "@/features/projects/kanban/hooks/use-comments";
import { formatCommentTimestamp } from "@/lib/date-formatter";
import { getInitials, memberDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type CommentItemProps = {
	comment: TaskComment;
	isPending?: boolean;
	isDeleting?: boolean;
	isUpdating?: boolean;
	onDelete?: () => unknown;
	onUpdate?: (content: string) => unknown;
};

// createdAt comes from Postgres while an edit's updatedAt comes from the app
// server, so clock skew needs absorbing before calling a comment edited.
const EDITED_THRESHOLD_MS = 1000;

export function CommentItem({
	comment,
	isPending = false,
	isDeleting = false,
	isUpdating = false,
	onDelete,
	onUpdate,
}: CommentItemProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [isEditing, setEditing] = useState(false);
	const [draft, setDraft] = useState(comment.content);

	const author = comment.author;
	const name = memberDisplayName(author);

	// A row still in flight has no real id yet, so it cannot be deleted.
	const canDelete = comment.isOwn && !isPending && Boolean(onDelete);
	const canEdit = comment.isOwn && !isPending && Boolean(onUpdate);

	const isEdited =
		new Date(comment.updatedAt).getTime() -
			new Date(comment.createdAt).getTime() >
		EDITED_THRESHOLD_MS;

	const trimmedDraft = draft.trim();
	const canSave =
		!isUpdating && trimmedDraft !== "" && trimmedDraft !== comment.content;

	const startEditing = () => {
		setDraft(comment.content);
		setEditing(true);
	};

	const cancelEditing = () => {
		setDraft(comment.content);
		setEditing(false);
	};

	const handleSave = async () => {
		if (!canSave) return;

		setEditing(false);
		await onUpdate?.(trimmedDraft);
	};

	return (
		<div
			className={cn(
				"flex min-w-0 gap-2.5 transition-opacity",
				(isPending || isDeleting) && "opacity-60",
			)}
		>
			<Avatar className="mt-0.5 size-7 shrink-0">
				{author.imageUrl && <AvatarImage src={author.imageUrl} alt={name} />}

				<AvatarFallback className="text-[10px]">
					{getInitials(author.firstName, author.lastName)}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<span className="min-w-0 truncate text-xs font-medium">{name}</span>

					<span className="shrink-0 text-[11px] text-muted-foreground">
						{isPending
							? "Posting..."
							: formatCommentTimestamp(comment.createdAt)}
					</span>

					{isEdited && !isPending && (
						<span className="shrink-0 text-[11px] text-muted-foreground">
							· Edited
						</span>
					)}

					{(canEdit || canDelete) && (
						<div className="ml-auto shrink-0">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										disabled={isDeleting || isUpdating}
										aria-label="Comment options"
										className="text-muted-foreground"
									>
										<MoreHorizontal />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end" className="w-40">
									{canEdit && !isEditing && (
										<DropdownMenuItem onSelect={startEditing}>
											<Pencil />
											Edit
										</DropdownMenuItem>
									)}

									{canDelete && (
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => setConfirmDelete(true)}
										>
											<Trash2 />
											Delete
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>

				{isEditing ? (
					<div className="mt-1 space-y-2">
						<Textarea
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Escape") {
									event.preventDefault();
									cancelEditing();
									return;
								}

								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									handleSave();
								}
							}}
							aria-label="Edit comment"
							maxLength={1000}
							rows={3}
							className="resize-none"
						/>

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={cancelEditing}
								disabled={isUpdating}
							>
								Cancel
							</Button>

							<Button
								type="button"
								size="sm"
								onClick={handleSave}
								disabled={!canSave}
							>
								{isUpdating ? "Saving..." : "Save"}
							</Button>
						</div>
					</div>
				) : (
					<p className="mt-0.5 min-w-0 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
						{comment.content}
					</p>
				)}
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent className="min-w-0 sm:max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this comment?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently removes your comment. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isDeleting}
							onClick={async (event) => {
								// Prevent the dialog from closing immediately so the user sees the "Deleting..." state.
								event.preventDefault();
								await onDelete?.();
								setConfirmDelete(false);
							}}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
