"use client";

import {
	Check,
	FolderKanban,
	MoreHorizontal,
	UserCog,
	UserMinus,
} from "lucide-react";
import { useState } from "react";
import { useWorkspaceMemberActions } from "@/hooks/use-workspace-member-actions";
import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { getInitials, memberDisplayName } from "@/lib/utils/project-members";
import {
	getOccupationLabel,
	type WorkspaceMemberListItem,
} from "@/lib/utils/workspace-members";
import type { WorkspaceMemberRole } from "@/types/workspace";
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
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MemberCardShell } from "./member-card-shell";
import { MemberRoleBadge } from "./member-role-badge";

type AssignableRole = Exclude<WorkspaceMemberRole, "owner">;

type PendingAction = { type: "kick" } | { type: "role"; role: AssignableRole };

type MemberCardProps = {
	member: WorkspaceMemberListItem;
	isOnline: boolean;
	canManage: boolean;
	workspaceSlug: string;
};

const MAX_LISTED_PROJECTS = 5;

const ROLE_OPTIONS: { value: AssignableRole; label: string }[] = [
	{ value: "admin", label: "Admin" },
	{ value: "member", label: "Member" },
];

export function MemberCard({
	member,
	isOnline,
	canManage,
	workspaceSlug,
}: MemberCardProps) {
	const name = memberDisplayName(member.user);
	const occupation = getOccupationLabel(member.user.occupation);

	const [pending, setPending] = useState<PendingAction | null>(null);

	const { updateRole, updatingUserId, removeMember, removingMemberId } =
		useWorkspaceMemberActions(workspaceSlug);

	const ledProjects = member.ledProjects;
	const leadsProjects = ledProjects.length > 0;

	const isBusy =
		updatingUserId === member.userId || removingMemberId === member.id;

	const isKickBlocked = pending?.type === "kick" && leadsProjects;

	const handleConfirm = async () => {
		if (!pending) return;

		const result =
			pending.type === "kick"
				? await removeMember(member.id)
				: await updateRole({ userId: member.userId, role: pending.role });

		if (result.success) {
			setPending(null);
		}
	};

	return (
		<>
			<MemberCardShell
				title={name}
				email={member.user.email}
				avatar={
					<Avatar className="size-10 shrink-0">
						{member.user.imageUrl && (
							<AvatarImage src={member.user.imageUrl} alt={name} />
						)}

						<AvatarFallback className="text-xs">
							{getInitials(member.user.firstName, member.user.lastName)}
						</AvatarFallback>
					</Avatar>
				}
				subtitle={
					<p
						className={cn(
							"truncate text-xs text-muted-foreground",
							!occupation && "italic opacity-60",
						)}
					>
						{occupation ?? "No occupation set"}
					</p>
				}
				badge={<MemberRoleBadge role={member.role} />}
				trailing={
					canManage ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									disabled={isBusy}
									aria-label={`Manage ${name}`}
									className="size-8"
								>
									<MoreHorizontal className="size-4" />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end">
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<UserCog className="size-4" />
										Edit Role
									</DropdownMenuSubTrigger>

									<DropdownMenuSubContent>
										{ROLE_OPTIONS.map((option) => (
											<DropdownMenuItem
												key={option.value}
												disabled={member.role === option.value}
												onSelect={() =>
													setPending({ type: "role", role: option.value })
												}
											>
												{member.role === option.value ? (
													<Check className="size-4" />
												) : (
													<span className="size-4" />
												)}

												{option.label}
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>

								<DropdownMenuItem
									variant="destructive"
									onSelect={() => setPending({ type: "kick" })}
								>
									<UserMinus className="size-4" />
									Kick Member
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : null
				}
				status={
					<div className="flex shrink-0 items-center gap-1.5">
						<span
							className={cn(
								"size-1.5 rounded-full",
								isOnline ? "bg-emerald-500" : "bg-muted-foreground/50",
							)}
						/>

						<span>{isOnline ? "Online" : "Offline"}</span>
					</div>
				}
				footerLeft={
					<div className="flex items-center gap-1">
						<FolderKanban className="size-3 shrink-0" />

						<span>
							{member.projectCount}{" "}
							{member.projectCount === 1 ? "project" : "projects"}
						</span>
					</div>
				}
				footerRight={
					<span className="truncate">
						Joined {formatProjectDate(member.joinedAt)}
					</span>
				}
			/>

			<AlertDialog
				open={Boolean(pending)}
				onOpenChange={(open) => {
					if (!open) setPending(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{isKickBlocked
								? `Can't remove ${name}`
								: pending?.type === "kick"
									? `Remove ${name}?`
									: pending?.role === "admin"
										? `Make ${name} an admin?`
										: `Make ${name} a member?`}
						</AlertDialogTitle>

						<AlertDialogDescription>
							{isKickBlocked
								? `${name} leads ${ledProjects.length === 1 ? "a project" : `${ledProjects.length} projects`}. Transfer the project lead role before removing them from the workspace.`
								: pending?.type === "kick"
									? `${name} will lose access to this workspace and every project in it. Their tasks and comments stay where they are.`
									: pending?.role === "admin"
										? `${name} will be able to invite and remove members, and manage every project in this workspace.`
										: `${name} will lose the ability to manage members and projects in this workspace.`}
						</AlertDialogDescription>
					</AlertDialogHeader>

					{isKickBlocked && (
						<ul className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
							{ledProjects.slice(0, MAX_LISTED_PROJECTS).map((project) => (
								<li key={project.id} className="truncate">
									• {project.name}
								</li>
							))}

							{ledProjects.length > MAX_LISTED_PROJECTS && (
								<li className="text-muted-foreground">
									+{ledProjects.length - MAX_LISTED_PROJECTS} more
								</li>
							)}
						</ul>
					)}

					<AlertDialogFooter>
						{isKickBlocked ? (
							<AlertDialogCancel>Close</AlertDialogCancel>
						) : (
							<>
								<AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>

								<AlertDialogAction
									variant={pending?.type === "kick" ? "destructive" : "default"}
									disabled={isBusy}
									onClick={(event) => {
										// Keep the dialog mounted until the mutation resolves.
										event.preventDefault();
										handleConfirm();
									}}
								>
									{isBusy
										? "Working..."
										: pending?.type === "kick"
											? "Remove"
											: "Confirm"}
								</AlertDialogAction>
							</>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
