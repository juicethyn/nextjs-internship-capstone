"use client";

import { Crown, MoreHorizontal, UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectMembers } from "@/hooks/use-project-members";
import {
	getProjectRoster,
	memberDisplayName,
	type ProjectRosterEntry,
} from "@/lib/utils/project-members";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";
import { ProjectMemberRow } from "./project-member-row";

type MembersTabProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
	canManage: boolean;
};

type PendingAction = {
	type: "remove" | "transfer";
	entry: ProjectRosterEntry;
};

export function MembersTab({
	project,
	workspaceSlug,
	projectSlug,
	canManage,
}: MembersTabProps) {
	const closeProjectSettings = useUIStore(
		(state) => state.closeProjectSettings,
	);
	const openProjectInvite = useUIStore((state) => state.openProjectInvite);

	const { removeMember, removingUserId, transferLead, transferringUserId } =
		useProjectMembers({ workspaceSlug, projectSlug });

	const [pending, setPending] = useState<PendingAction | null>(null);

	const roster = useMemo(() => getProjectRoster(project), [project]);

	const isArchived = project.isArchived;
	const isEditable = canManage && !isArchived;
	const isBusy = Boolean(removingUserId) || Boolean(transferringUserId);

	const handleAddMembers = () => {
		closeProjectSettings();
		openProjectInvite();
	};

	const handleConfirm = async () => {
		if (!pending) return;

		const result =
			pending.type === "remove"
				? await removeMember(pending.entry.userId)
				: await transferLead(pending.entry.userId);

		if (result.success) {
			setPending(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex min-w-0 items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="text-sm font-semibold">
						Project members ({roster.length})
					</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Manage who has access to this project.
					</p>
				</div>

				{isEditable && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleAddMembers}
						className="shrink-0"
					>
						<UserPlus className="size-4" />
						<span className="hidden sm:inline">Add members</span>
					</Button>
				)}
			</div>

			{!project.leadId && (
				<p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
					This project has no lead assigned. Promote a member to project lead.
				</p>
			)}

			{canManage && isArchived && (
				<p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
					This project is archived. Restore it to change membership.
				</p>
			)}

			{roster.length === 0 ? (
				<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
					This project has no members yet.
				</p>
			) : (
				<ul className="board-scrollbar max-h-72 min-w-0 divide-y overflow-y-auto rounded-lg border px-3">
					{roster.map((entry) => (
						<li key={entry.userId} className="min-w-0">
							<ProjectMemberRow
								user={entry.user}
								isLead={entry.isLead}
								trailing={
									isEditable ? (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													disabled={isBusy}
													aria-label={`Manage ${memberDisplayName(entry.user)}`}
													className="size-8"
												>
													<MoreHorizontal className="size-4" />
												</Button>
											</DropdownMenuTrigger>

											<DropdownMenuContent align="end">
												{!entry.isLead && (
													<DropdownMenuItem
														onSelect={() =>
															setPending({ type: "transfer", entry })
														}
													>
														<Crown className="size-4" />
														Transfer Lead
													</DropdownMenuItem>
												)}

												{/* The lead is never removable — transfer the role first. */}
												{!entry.isLead && (
													<DropdownMenuItem
														variant="destructive"
														onSelect={() =>
															setPending({ type: "remove", entry })
														}
													>
														<UserMinus className="size-4" />
														Remove Member
													</DropdownMenuItem>
												)}

												{entry.isLead && (
													<DropdownMenuItem disabled>Transfer</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									) : null
								}
							/>
						</li>
					))}
				</ul>
			)}

			<AlertDialog
				open={Boolean(pending)}
				onOpenChange={(open) => {
					if (!open) setPending(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{pending?.type === "remove"
								? "Remove this member?"
								: "Make this member the project lead?"}
						</AlertDialogTitle>

						<AlertDialogDescription>
							{!pending
								? ""
								: pending.type === "remove"
									? `${memberDisplayName(pending.entry.user)} will lose access to this project. Their assigned tasks will remain in the project.`
									: `${memberDisplayName(pending.entry.user)} will become the project lead. You will stay a project member and can no longer be the lead.`}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							variant="destructive"
							disabled={isBusy}
							onClick={(event) => {
								// Keep the dialog mounted until the mutation resolves.
								event.preventDefault();
								handleConfirm();
							}}
						>
							{isBusy
								? "Working..."
								: pending?.type === "remove"
									? "Remove"
									: "Transfer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
