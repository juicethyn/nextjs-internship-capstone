"use client";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { useTaskAttachments } from "@/features/projects/kanban/hooks/use-task-attachments";
import { TaskAttachmentRow } from "./task-attachment-row";

type TaskAttachmentListProps = {
	attachments: ReturnType<typeof useTaskAttachments>["attachments"];
	isLoading: boolean;
	isUploading: boolean;
	downloadingId: string | null;
	removingId: string | null;
	onDownload: (attachmentId: string) => void;
	onRemove: (attachmentId: string) => void;
};

export function TaskAttachmentList({
	attachments,
	isLoading,
	isUploading,
	downloadingId,
	removingId,
	onDownload,
	onRemove,
}: TaskAttachmentListProps) {
	if (!isLoading && !isUploading && attachments.length === 0) {
		return null;
	}

	return (
		<div className="min-w-0 space-y-1.5">
			<Label className="text-xs text-muted-foreground">
				Attachments
				{attachments.length > 0 && ` (${attachments.length})`}
			</Label>

			<div className="min-w-0 space-y-2">
				{attachments.map((attachment) => (
					<TaskAttachmentRow
						key={attachment.id}
						attachment={attachment}
						isDownloading={downloadingId === attachment.id}
						isRemoving={removingId === attachment.id}
						onDownload={() => onDownload(attachment.id)}
						onRemove={() => onRemove(attachment.id)}
					/>
				))}

				{(isLoading || isUploading) && <Skeleton className="h-12 w-full" />}
			</div>
		</div>
	);
}
