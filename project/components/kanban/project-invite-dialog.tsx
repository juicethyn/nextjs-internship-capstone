"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectMemberRow } from "@/components/project-settings/project-member-row";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import {
	filterMembersBySearch,
	getAvailableWorkspaceMembers,
	getProjectRoster,
	memberDisplayName,
} from "@/lib/utils/project-members";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectDetail } from "@/types/projects";

type ProjectInviteDialogProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
	canManageProject: boolean;
};

export function ProjectInviteDialog({
	project,
	workspaceSlug,
	projectSlug,
	canManageProject,
}: ProjectInviteDialogProps) {
	const isOpen = useUIStore((state) => state.isProjectInviteOpen);
	const setOpen = useUIStore((state) => state.setProjectInviteOpen);

	const [search, setSearch] = useState("");
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const { members: workspaceMembers, isLoading } = useWorkspaceMembers(
		workspaceSlug,
		isOpen,
	);
	const { addMembers, isAdding } = useProjectMembers({
		workspaceSlug,
		projectSlug,
	});

	const roster = useMemo(() => getProjectRoster(project), [project]);

	const available = useMemo(
		() => getAvailableWorkspaceMembers(workspaceMembers, roster),
		[workspaceMembers, roster],
	);

	const visibleAvailable = useMemo(
		() => filterMembersBySearch(available, search),
		[available, search],
	);

	const isArchived = project.isArchived;
	const canAdd = canManageProject && !isArchived;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setSearch("");
			setSelectedUserIds([]);
		}

		setOpen(open);
	};

	const toggleSelected = (userId: string) => {
		setSelectedUserIds((current) =>
			current.includes(userId)
				? current.filter((id) => id !== userId)
				: [...current, userId],
		);
	};

	const handleAdd = async () => {
		const result = await addMembers(selectedUserIds);

		if (result.success) {
			setSelectedUserIds([]);
			setSearch("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[85vh] min-w-0 flex-col gap-0 p-0 sm:max-w-md">
				<DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 text-left">
					<DialogTitle className="text-base">Add members</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						Add people from this workspace to {project.name}. They join the
						project right away.
					</DialogDescription>
				</DialogHeader>

				<div className="board-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
					{!canManageProject && (
						<p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
							Only the project lead or a workspace owner/admin can add members.
						</p>
					)}

					{canManageProject && isArchived && (
						<p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
							This project is archived. Restore it from Settings to add members.
						</p>
					)}

					{canAdd && (
						<section className="min-w-0 space-y-2">
							<div className="flex min-w-0 items-baseline justify-between gap-2">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Add from workspace
								</h3>

								{available.length > 0 && (
									<span className="shrink-0 text-xs text-muted-foreground">
										{visibleAvailable.length} of {available.length}
									</span>
								)}
							</div>

							<div className="relative">
								<Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

								<Input
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search workspace members"
									aria-label="Search workspace members"
									className="px-8"
								/>

								{search && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setSearch("")}
										aria-label="Clear search"
										className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
									>
										<X className="size-3.5" />
									</Button>
								)}
							</div>

							{isLoading && (
								<div className="space-y-2 pt-1">
									<Skeleton className="h-11 w-full" />
									<Skeleton className="h-11 w-full" />
								</div>
							)}

							{!isLoading && available.length === 0 && (
								<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
									Everyone in this workspace is already on this project.
								</p>
							)}

							{!isLoading &&
								available.length > 0 &&
								visibleAvailable.length === 0 && (
									<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
										No workspace members match "{search}".
									</p>
								)}

							{visibleAvailable.length > 0 && (
								<ul className="board-scrollbar max-h-56 min-w-0 divide-y overflow-y-auto rounded-lg border px-3">
									{visibleAvailable.map((member) => {
										const checkboxId = `invite-${member.userId}`;
										const isSelected = selectedUserIds.includes(member.userId);

										return (
											<li key={member.userId} className="min-w-0">
												<label
													htmlFor={checkboxId}
													className="flex min-w-0 cursor-pointer items-center gap-3"
												>
													<Checkbox
														id={checkboxId}
														checked={isSelected}
														onCheckedChange={() =>
															toggleSelected(member.userId)
														}
														aria-label={`Select ${memberDisplayName(member.user)}`}
													/>

													<div className="min-w-0 flex-1">
														<ProjectMemberRow
															user={member.user}
															showRole={false}
														/>
													</div>
												</label>
											</li>
										);
									})}
								</ul>
							)}
						</section>
					)}

					{canAdd && <Separator />}

					<section className="min-w-0 space-y-1">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Project members ({roster.length})
						</h3>

						{roster.length === 0 ? (
							<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
								This project has no members yet.
							</p>
						) : (
							<ul className="min-w-0 divide-y">
								{roster.map((entry) => (
									<li key={entry.userId} className="min-w-0">
										<ProjectMemberRow user={entry.user} isLead={entry.isLead} />
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<div className="flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3">
					{canAdd && (
						<Button
							type="button"
							size="sm"
							onClick={handleAdd}
							disabled={selectedUserIds.length === 0 || isAdding}
							className="w-full sm:w-auto"
						>
							{isAdding
								? "Adding..."
								: selectedUserIds.length === 0
									? "Add members"
									: selectedUserIds.length === 1
										? "Add 1 member"
										: `Add ${selectedUserIds.length} members`}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
