"use client";

import { Download, FileText, ImageIcon, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskAttachment } from "@/features/projects/kanban/hooks/use-task-attachments";
import { formatFileSize } from "@/features/projects/kanban/lib/format-file-size";
import { cn } from "@/lib/utils";

type TaskAttachmentRowProps = {
	attachment: TaskAttachment;
	isDownloading?: boolean;
	isRemoving?: boolean;
	onDownload: () => void;
	onRemove: () => void;
};

export function TaskAttachmentRow({
	attachment,
	isDownloading = false,
	isRemoving = false,
	onDownload,
	onRemove,
}: TaskAttachmentRowProps) {
	const isImage = attachment.fileType.startsWith("image/");

	const Icon = isImage ? ImageIcon : FileText;

	return (
		<div
			className={cn(
				"flex min-w-0 items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2 transition-opacity",
				isRemoving && "opacity-60",
			)}
		>
			<Icon className="size-4 shrink-0 text-muted-foreground" />

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm">{attachment.fileName}</p>

				<p className="text-[11px] text-muted-foreground">
					{formatFileSize(attachment.fileSize)}
				</p>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						disabled={isRemoving || isDownloading}
						aria-label={`Options for ${attachment.fileName}`}
						className="shrink-0 text-muted-foreground"
					>
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem onSelect={onDownload}>
						<Download />
						Download
					</DropdownMenuItem>

					{attachment.canRemove && (
						<DropdownMenuItem variant="destructive" onSelect={onRemove}>
							<X />
							Remove
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
