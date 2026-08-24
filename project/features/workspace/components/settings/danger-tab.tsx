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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useWorkspaceMembers } from "@/features/members/hooks/use-workspace-members";
import { useWorkspaceSettings } from "@/features/workspace/hooks/use-workspace-settings";

type DangerTabProps = {
	workspaceSlug: string;
	workspaceName: string;
	onDone: () => void;
};

export function DangerTab({
	workspaceSlug,
	workspaceName,
	onDone,
}: DangerTabProps) {
	const { members, isLoading } = useWorkspaceMembers(workspaceSlug);
	const { transferOwnership, isTransferring, deleteWorkspace, isDeleting } =
		useWorkspaceSettings(workspaceSlug);

	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	const canDelete = deleteConfirmText.trim() === workspaceName;

	const deleteDescription =
		members.length > 1
			? `This permanently deletes ${workspaceName} and every project, task, and comment in it for all ${members.length} members. This cannot be undone.`
			: `This permanently deletes ${workspaceName} and everything in it. This cannot be undone.`;

	const transferableMembers = members.filter(
		(member) => member.role !== "owner",
	);

	const selectedMember = transferableMembers.find(
		(member) => member.userId === selectedUserId,
	);

	const memberLabel = (member: (typeof transferableMembers)[number]) => {
		const fullName = [member.user.firstName, member.user.lastName]
			.filter(Boolean)
			.join(" ");

		return fullName || member.user.email;
	};

	const handleTransfer = async () => {
		const result = await transferOwnership(selectedUserId);

		setConfirmOpen(false);

		if (result.success) {
			// The current user is now an admin, so this tab must go away.
			onDone();
		}
	};

	const handleDelete = async () => {
		const result = await deleteWorkspace();

		if (result.success) {
			setConfirmDelete(false);
			onDone();
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4 rounded-lg border border-destructive/50 p-4">
				<div>
					<h3 className="text-sm font-semibold">Transfer ownership</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Hand this workspace to another member. You will become an admin and
						this cannot be undone.
					</p>
				</div>

				{isLoading && (
					<p className="text-sm text-muted-foreground">Loading members...</p>
				)}

				{!isLoading && transferableMembers.length === 0 && (
					<p className="text-sm text-muted-foreground">
						There is no one else in this workspace to transfer ownership to.
						Invite a member first.
					</p>
				)}

				{!isLoading && transferableMembers.length > 0 && (
					<>
						<div className="space-y-2">
							<Label htmlFor="new-owner">New owner</Label>

							<Select value={selectedUserId} onValueChange={setSelectedUserId}>
								<SelectTrigger id="new-owner" className="w-full">
									<SelectValue placeholder="Select a member" />
								</SelectTrigger>

								<SelectContent>
									{transferableMembers.map((member) => (
										<SelectItem key={member.userId} value={member.userId}>
											{memberLabel(member)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button
							type="button"
							variant="destructive"
							disabled={!selectedUserId || isTransferring}
							onClick={() => setConfirmOpen(true)}
						>
							{isTransferring ? "Transferring..." : "Transfer ownership"}
						</Button>
					</>
				)}
			</div>

			<div className="space-y-3 rounded-lg border border-destructive/50 p-4">
				<div>
					<h3 className="text-sm font-semibold">Delete workspace</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Permanently delete this workspace along with every project, task,
						comment, and label inside it. This cannot be undone.
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
					Delete workspace
				</Button>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this workspace?</AlertDialogTitle>

						<AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="space-y-2">
						<Label htmlFor="delete-workspace-confirm">
							Type <span className="font-semibold">{workspaceName}</span> to
							confirm
						</Label>

						<Input
							id="delete-workspace-confirm"
							value={deleteConfirmText}
							onChange={(event) => setDeleteConfirmText(event.target.value)}
							disabled={isDeleting}
							autoComplete="off"
							placeholder={workspaceName}
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
							{isDeleting ? "Deleting..." : "Delete workspace"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Transfer ownership?</AlertDialogTitle>

						<AlertDialogDescription>
							{selectedMember
								? `${memberLabel(selectedMember)} will become the owner of this workspace. You will be demoted to admin and cannot undo this.`
								: ""}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isTransferring}>
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={isTransferring}
							onClick={(event) => {
								// Keep the dialog mounted until the mutation resolves.
								event.preventDefault();
								handleTransfer();
							}}
						>
							{isTransferring ? "Transferring..." : "Transfer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
