"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectSettings } from "@/features/projects/hooks/use-project-settings";
import type { ProjectDetail } from "@/features/projects/types";

type DangerTabProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
	onDone: () => void;
};

export function DangerTab({
	project,
	workspaceSlug,
	projectSlug,
	onDone,
}: DangerTabProps) {
	const {
		archiveProject,
		isArchiving,
		restoreProject,
		isRestoring,
		deleteProject,
		isDeleting,
	} = useProjectSettings({ workspaceSlug, projectSlug });

	const [confirmArchive, setConfirmArchive] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	const isArchived = project.isArchived;
	const canDelete = deleteConfirmText.trim() === project.name;

	const handleArchive = async () => {
		const result = await archiveProject();

		setConfirmArchive(false);

		if (result.success) {
			onDone();
		}
	};

	const handleRestore = async () => {
		await restoreProject();
	};

	const handleDelete = async () => {
		const result = await deleteProject();

		if (result.success) {
			setConfirmDelete(false);
			onDone();
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3 rounded-lg border p-4">
				<div>
					<h3 className="text-sm font-semibold">
						{isArchived ? "Restore project" : "Archive project"}
					</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						{isArchived
							? "Bring this project back so its board and members can be edited again."
							: "Hide this project from the active list and lock its board. You can restore it later."}
					</p>
				</div>

				{isArchived ? (
					<Button
						type="button"
						variant="outline"
						disabled={isRestoring}
						onClick={handleRestore}
					>
						{isRestoring ? "Restoring..." : "Restore project"}
					</Button>
				) : (
					<Button
						type="button"
						variant="outline"
						disabled={isArchiving}
						onClick={() => setConfirmArchive(true)}
					>
						{isArchiving ? "Archiving..." : "Archive project"}
					</Button>
				)}
			</div>

			<div className="space-y-3 rounded-lg border border-destructive/50 p-4">
				<div>
					<h3 className="text-sm font-semibold">Delete project</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Permanently delete this project along with all of its lists, tasks,
						and comments. This cannot be undone.
					</p>
				</div>

				<Button
					type="button"
					variant="destructive"
					disabled={isDeleting}
					onClick={() => {
						setDeleteConfirmText("");
						setConfirmDelete(true);
					}}
				>
					Delete project
				</Button>
			</div>

			<AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Archive this project?</AlertDialogTitle>

						<AlertDialogDescription>
							{project.name} will be locked and moved out of the active project
							list. You can restore it from this tab at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isArchiving}
							onClick={(event) => {
								event.preventDefault();
								handleArchive();
							}}
						>
							{isArchiving ? "Archiving..." : "Archive"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this project?</AlertDialogTitle>

						<AlertDialogDescription>
							This permanently deletes {project.name} and everything in it. This
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="space-y-2">
						<Label htmlFor="delete-confirm">
							Type <span className="font-semibold">{project.name}</span> to
							confirm
						</Label>

						<Input
							id="delete-confirm"
							value={deleteConfirmText}
							onChange={(event) => setDeleteConfirmText(event.target.value)}
							disabled={isDeleting}
							autoComplete="off"
							placeholder={project.name}
						/>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={!canDelete || isDeleting}
							onClick={(event) => {
								event.preventDefault();
								handleDelete();
							}}
						>
							{isDeleting ? "Deleting..." : "Delete project"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
