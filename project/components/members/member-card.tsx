"use client";

import { FolderKanban, MoreHorizontal, UserCog, UserMinus } from "lucide-react";
import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { getInitials, memberDisplayName } from "@/lib/utils/project-members";
import {
	getOccupationLabel,
	type WorkspaceMemberListItem,
} from "@/lib/utils/workspace-members";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MemberCardShell } from "./member-card-shell";
import { MemberRoleBadge } from "./member-role-badge";

type MemberCardProps = {
	member: WorkspaceMemberListItem;
	isOnline: boolean;
	canManage: boolean;
};

export function MemberCard({ member, isOnline, canManage }: MemberCardProps) {
	const name = memberDisplayName(member.user);
	const occupation = getOccupationLabel(member.user.occupation);

	return (
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
								aria-label={`Manage ${name}`}
								className="size-8"
							>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							<DropdownMenuItem disabled>
								<UserCog className="size-4" />
								Edit Role
							</DropdownMenuItem>

							<DropdownMenuItem variant="destructive" disabled>
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
	);
}
