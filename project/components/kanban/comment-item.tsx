"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TaskComment } from "@/hooks/use-comments";
import { formatCommentTimestamp } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { getInitials, memberDisplayName } from "@/lib/utils/project-members";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type CommentItemProps = {
	comment: TaskComment;
	isPending?: boolean;
	isDeleting?: boolean;
	onDelete?: () => unknown;
};

export function CommentItem({
	comment,
	isPending = false,
	isDeleting = false,
	onDelete,
}: CommentItemProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);

	const author = comment.author;
	const name = memberDisplayName(author);

	// A row still in flight has no real id yet, so it cannot be deleted.
	const canDelete = comment.isOwn && !isPending && Boolean(onDelete);

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

					{canDelete && (
						<div className="ml-auto shrink-0">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										disabled={isDeleting}
										aria-label="Comment options"
										className="text-muted-foreground"
									>
										<MoreHorizontal />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end" className="w-40">
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => setConfirmDelete(true)}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>

				<p className="mt-0.5 min-w-0 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
					{comment.content}
				</p>
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
