"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { PENDING_COMMENT_PREFIX, useComments } from "@/hooks/use-comments";
import { createCommentSchema } from "@/lib/validations/comment";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { CommentItem } from "./comment-item";

type TaskCommentsProps = {
	taskId: string;
	workspaceSlug: string;
	projectSlug: string;
};

// Relative labels go stale on their own, so nudge a re-render periodically rather than running a timer per row.
const TICK_MS = 30_000;

export function TaskComments({
	taskId,
	workspaceSlug,
	projectSlug,
}: TaskCommentsProps) {
	const {
		comments,
		isLoading,
		createComment,
		deleteComment,
		deletingCommentId,
	} = useComments({ workspaceSlug, projectSlug, taskId });

	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [, forceTick] = useState(0);

	useEffect(() => {
		const id = setInterval(() => forceTick((tick) => tick + 1), TICK_MS);

		return () => clearInterval(id);
	}, []);

	const handlePost = () => {
		const result = createCommentSchema.safeParse({ content: draft.trim() });

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		setError(null);
		setDraft("");

		createComment({ content: result.data.content }).catch(() => undefined);
	};

	return (
		<section className="flex min-w-0 flex-col gap-3">
			<div className="flex items-center gap-2">
				<MessageSquare className="size-4 shrink-0 text-muted-foreground" />

				<h3 className="text-sm font-semibold">
					Comments
					{comments.length > 0 && (
						<span className="ml-1.5 font-normal text-muted-foreground">
							({comments.length})
						</span>
					)}
				</h3>
			</div>

			<div className="space-y-2">
				<Textarea
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						// Enter posts, Shift+Enter breaks the line.
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							handlePost();
						}
					}}
					placeholder="Write a comment..."
					aria-label="Write a comment"
					maxLength={1000}
					rows={3}
					className="resize-none"
				/>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<div className="flex justify-end">
					<Button
						type="button"
						size="sm"
						onClick={handlePost}
						disabled={draft.trim() === ""}
						className="w-full sm:w-auto"
					>
						Post
					</Button>
				</div>
			</div>

			{isLoading && (
				<div className="space-y-3">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			)}

			{!isLoading && comments.length === 0 && (
				<p className="rounded-lg p-6 text-center text-sm text-muted-foreground">
					No comments yet. Start the conversation.
				</p>
			)}

			{comments.length > 0 && (
				<ul className="min-w-0 space-y-4">
					{comments.map((comment) => (
						<li key={comment.id} className="min-w-0">
							<CommentItem
								comment={comment}
								isPending={comment.id.startsWith(PENDING_COMMENT_PREFIX)}
								isDeleting={deletingCommentId === comment.id}
								onDelete={() =>
									deleteComment(comment.id).catch(() => undefined)
								}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
