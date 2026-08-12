"use client";

import {
	FolderKanban,
	Mail,
	MoreHorizontal,
	UserCog,
	UserMinus,
} from "lucide-react";
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
		<div
			className="
				flex
				flex-col
				gap-4
				rounded-xl
				border
				bg-card
				p-4
				transition-colors
				hover:border-primary/30
				sm:p-5
			"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2.5">
					<Avatar className="size-10 shrink-0">
						{member.user.imageUrl && (
							<AvatarImage src={member.user.imageUrl} alt={name} />
						)}

						<AvatarFallback className="text-xs">
							{getInitials(member.user.firstName, member.user.lastName)}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0">
						<h3 className="truncate text-sm font-semibold">{name}</h3>

						<p
							className={cn(
								"truncate text-xs text-muted-foreground",
								!occupation && "italic opacity-60",
							)}
						>
							{occupation ?? "No occupation set"}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<MemberRoleBadge role={member.role} />

					{canManage && (
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
					)}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
				<div className="flex min-w-0 items-center gap-1.5">
					<Mail className="size-3.5 shrink-0" />

					<span className="truncate">{member.user.email}</span>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<span
						className={cn(
							"size-1.5 rounded-full",
							isOnline ? "bg-emerald-500" : "bg-muted-foreground/50",
						)}
					/>

					<span>{isOnline ? "Online" : "Offline"}</span>
				</div>
			</div>

			<div className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-[11px] text-muted-foreground">
				<div className="flex items-center gap-1">
					<FolderKanban className="size-3 shrink-0" />

					<span>
						{member.projectCount}{" "}
						{member.projectCount === 1 ? "project" : "projects"}
					</span>
				</div>

				<span className="truncate">
					Joined {formatProjectDate(member.joinedAt)}
				</span>
			</div>
		</div>
	);
}
