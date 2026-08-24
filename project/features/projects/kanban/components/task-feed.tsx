"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	PENDING_COMMENT_PREFIX,
	useComments,
} from "@/features/projects/kanban/hooks/use-comments";
import { useTaskActivity } from "@/features/projects/kanban/hooks/use-task-activity";
import { mergeTaskFeed } from "@/features/projects/kanban/lib/task-feed";
import { createCommentSchema } from "@/lib/validations/comment";
import { CommentItem } from "./comment-item";
import { TaskActivityItem } from "./task-activity-item";

type TaskFeedProps = {
	taskId: string;
	workspaceSlug: string;
	projectSlug: string;
};

// Relative labels go stale on their own, so nudge a re-render periodically rather than running a timer per row.
const TICK_MS = 30_000;

export function TaskFeed({
	taskId,
	workspaceSlug,
	projectSlug,
}: TaskFeedProps) {
	const {
		comments,
		isLoading,
		createComment,
		updateComment,
		updatingCommentId,
		deleteComment,
		deletingCommentId,
	} = useComments({ workspaceSlug, projectSlug, taskId });

	const [showActivity, setShowActivity] = useState(false);

	const { activity, isLoading: isActivityLoading } = useTaskActivity({
		workspaceSlug,
		projectSlug,
		taskId,
		enabled: showActivity,
	});

	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [, forceTick] = useState(0);

	useEffect(() => {
		const id = setInterval(() => forceTick((tick) => tick + 1), TICK_MS);

		return () => clearInterval(id);
	}, []);

	const entries = useMemo(
		() => mergeTaskFeed(comments, activity, showActivity),
		[comments, activity, showActivity],
	);

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

	const isEmpty = !isLoading && entries.length === 0;

	return (
		<section className="flex min-w-0 flex-col gap-3">
			<div className="flex min-w-0 items-center justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2">
					<MessageSquare className="size-4 shrink-0 text-muted-foreground" />

					<h3 className="min-w-0 truncate text-sm font-semibold">
						Comments &amp; Activity
					</h3>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setShowActivity((current) => !current)}
					aria-pressed={showActivity}
					className="h-auto shrink-0 px-2 py-1 text-xs text-muted-foreground"
				>
					{showActivity ? "Hide activity" : "Show activity"}
				</Button>
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

			{(isLoading || (showActivity && isActivityLoading)) && (
				<div className="space-y-3">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
			)}

			{isEmpty && (
				<p className="rounded-lg p-6 text-center text-sm text-muted-foreground">
					No comments yet. Start the conversation.
				</p>
			)}

			{entries.length > 0 && (
				<ul className="min-w-0 space-y-4">
					{entries.map((entry) => (
						<li key={`${entry.kind}-${entry.id}`} className="min-w-0">
							{entry.kind === "comment" ? (
								<CommentItem
									comment={entry.comment}
									isPending={entry.id.startsWith(PENDING_COMMENT_PREFIX)}
									isDeleting={deletingCommentId === entry.id}
									isUpdating={updatingCommentId === entry.id}
									onDelete={() =>
										deleteComment(entry.id).catch(() => undefined)
									}
									onUpdate={(content) =>
										updateComment({ commentId: entry.id, content }).catch(
											() => undefined,
										)
									}
								/>
							) : (
								<TaskActivityItem activity={entry.activity} />
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
