"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	getInitials,
	getProjectRoleLabel,
	memberDisplayName,
} from "@/lib/utils/project-members";

type RowUser = {
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string | null;
};

type ProjectMemberRowProps = {
	user: RowUser;
	isLead?: boolean;
	showRole?: boolean;
	trailing?: ReactNode;
};

export function ProjectMemberRow({
	user,
	isLead = false,
	showRole = true,
	trailing,
}: ProjectMemberRowProps) {
	const name = memberDisplayName(user);

	return (
		<div className="flex min-w-0 items-center gap-3 py-1.5">
			<Avatar className="size-8 shrink-0">
				{user.imageUrl && <AvatarImage src={user.imageUrl} alt={name} />}

				<AvatarFallback className="text-xs">
					{getInitials(user.firstName, user.lastName)}
				</AvatarFallback>
			</Avatar>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{name}</p>

				<p className="truncate text-xs text-muted-foreground">{user.email}</p>
			</div>

			{showRole && (
				<Badge
					variant={isLead ? "default" : "secondary"}
					className="hidden shrink-0 font-normal sm:inline-flex"
				>
					{getProjectRoleLabel(isLead)}
				</Badge>
			)}

			{trailing && <div className="shrink-0">{trailing}</div>}
		</div>
	);
}
