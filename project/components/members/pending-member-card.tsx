"use client";

import { Clock, Mail, MoreHorizontal, Send, X } from "lucide-react";
import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";
import { getInitials, memberDisplayName } from "@/lib/utils/project-members";
import {
	getOccupationLabel,
	type PendingInvitationListItem,
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

type PendingMemberCardProps = {
	invitation: PendingInvitationListItem;
	canManage: boolean;
	isBusy: boolean;
	onResend: () => void;
	onRevoke: () => void;
};

export function PendingMemberCard({
	invitation,
	canManage,
	isBusy,
	onResend,
	onRevoke,
}: PendingMemberCardProps) {
	const invitee = invitation.user;

	// Unregistered invitees have no name to show, so the email becomes the title and the second line drops out rather than rendering the email twice.
	const name = invitee ? memberDisplayName(invitee) : null;
	const occupation = invitee ? getOccupationLabel(invitee.occupation) : null;

	return (
		<MemberCardShell
			dimmed
			title={name ?? invitation.email}
			email={invitation.email}
			avatar={
				invitee ? (
					<Avatar className="size-10 shrink-0">
						{invitee.imageUrl && (
							<AvatarImage
								src={invitee.imageUrl}
								alt={name ?? invitation.email}
							/>
						)}

						<AvatarFallback className="text-xs">
							{getInitials(invitee.firstName, invitee.lastName)}
						</AvatarFallback>
					</Avatar>
				) : (
					<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
						<Mail className="size-4 text-muted-foreground" />
					</div>
				)
			}
			subtitle={
				<p
					className={cn(
						"truncate text-xs text-muted-foreground",
						!occupation && "italic opacity-60",
					)}
				>
					{occupation ?? "Not registered yet"}
				</p>
			}
			badge={<MemberRoleBadge role={invitation.role} />}
			trailing={
				canManage ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								disabled={isBusy}
								aria-label={`Manage invitation for ${invitation.email}`}
								className="size-8"
							>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={onResend}>
								<Send className="size-4" />
								Resend Invite
							</DropdownMenuItem>

							<DropdownMenuItem variant="destructive" onSelect={onRevoke}>
								<X className="size-4" />
								Revoke Invite
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : null
			}
			status={
				<span className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
					<Clock className="size-2.5" />
					Invited
				</span>
			}
			footerLeft={<span>Awaiting response</span>}
			footerRight={
				<span className="truncate">
					Expires {formatProjectDate(invitation.expiresAt)}
				</span>
			}
		/>
	);
}
