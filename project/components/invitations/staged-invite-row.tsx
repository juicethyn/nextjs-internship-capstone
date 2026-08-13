"use client";

import { Mail, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, memberDisplayName } from "@/lib/utils/project-members";
import { getWorkspaceRoleLabel } from "@/lib/utils/workspace-members";
import type { StagedInvite } from "@/types/workspaceInvitation";

type StagedInviteRowProps = {
	invite: StagedInvite;
	onRemove: () => void;
	disabled?: boolean;
};

export function StagedInviteRow({
	invite,
	onRemove,
	disabled = false,
}: StagedInviteRowProps) {
	const name = invite.user ? memberDisplayName(invite.user) : null;

	return (
		<div className="flex min-w-0 items-center gap-3 py-2">
			{invite.user ? (
				<Avatar className="size-8 shrink-0">
					{invite.user.imageUrl && (
						<AvatarImage
							src={invite.user.imageUrl}
							alt={name ?? invite.email}
						/>
					)}

					<AvatarFallback className="text-xs">
						{getInitials(invite.user.firstName, invite.user.lastName)}
					</AvatarFallback>
				</Avatar>
			) : (
				<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
					<Mail className="size-3.5 text-muted-foreground" />
				</div>
			)}

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{name ?? invite.email}</p>

				{name && (
					<p className="truncate text-xs text-muted-foreground">
						{invite.email}
					</p>
				)}
			</div>

			<Badge variant="secondary" className="shrink-0 font-normal">
				{getWorkspaceRoleLabel(invite.role)}
			</Badge>

			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={onRemove}
				disabled={disabled}
				aria-label={`Remove ${invite.email}`}
				className="size-8 shrink-0"
			>
				<X className="size-3.5" />
			</Button>
		</div>
	);
}
