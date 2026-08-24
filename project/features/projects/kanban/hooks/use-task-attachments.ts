"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	deleteTaskAttachmentAction,
	getAttachmentDownloadUrlAction,
	getTaskAttachmentsAction,
} from "@/features/projects/kanban/actions/task-attachments";
import { useUploadThing } from "@/lib/uploadthing";

type AttachmentsSuccess = Extract<
	Awaited<ReturnType<typeof getTaskAttachmentsAction>>,
	{ data: unknown }
>;

export type TaskAttachment = AttachmentsSuccess["data"][number];

interface UseTaskAttachmentsProps {
	workspaceSlug: string;
	projectSlug: string;
	taskId: string;
	enabled?: boolean;
}

export function useTaskAttachments({
	workspaceSlug,
	projectSlug,
	taskId,
	enabled = true,
}: UseTaskAttachmentsProps) {
	const queryClient = useQueryClient();

	const inputRef = useRef<HTMLInputElement>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	const queryKey = ["task-attachments", workspaceSlug, projectSlug, taskId];

	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const result = await getTaskAttachmentsAction(
				workspaceSlug,
				projectSlug,
				taskId,
			);

			return result.success ? result.data : [];
		},
		enabled: enabled && taskId !== "",
	});

	const { startUpload, isUploading } = useUploadThing("taskAttachment", {
		onClientUploadComplete: () => {
			queryClient.invalidateQueries({ queryKey });
			toast.success("File attached.");
		},
		onUploadError: (uploadError) => {
			toast.error(uploadError.message || "Failed to attach that file.");
		},
	});

	const openFilePicker = () => inputRef.current?.click();

	const handleFileSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];

		event.target.value = "";

		if (!file) return;

		await startUpload([file], { workspaceSlug, projectSlug, taskId }).catch(
			() => undefined,
		);
	};

	const deleteMutation = useMutation({
		mutationFn: (attachmentId: string) =>
			deleteTaskAttachmentAction(workspaceSlug, projectSlug, attachmentId),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to remove that file.");
				return;
			}

			queryClient.invalidateQueries({ queryKey });
			toast.success("Attachment removed.");
		},
		onError: () => toast.error("Failed to remove that file."),
	});

	const download = async (attachmentId: string) => {
		setDownloadingId(attachmentId);

		const result = await getAttachmentDownloadUrlAction(
			workspaceSlug,
			projectSlug,
			attachmentId,
		);

		setDownloadingId(null);

		if (!result.success) {
			toast.error(result.message ?? "Couldn't prepare that download.");
			return;
		}

		const anchor = document.createElement("a");
		anchor.href = result.data.url;
		anchor.download = result.data.fileName;
		anchor.rel = "noopener";
		anchor.click();
	};

	return {
		attachments: query.data ?? [],
		isLoading: query.isLoading,

		inputRef,
		openFilePicker,
		handleFileSelected,
		isUploading,

		download,
		downloadingId,

		removeAttachment: deleteMutation.mutateAsync,
		removingId: deleteMutation.isPending ? deleteMutation.variables : null,
	};
}
