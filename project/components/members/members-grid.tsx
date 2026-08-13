"use client";

import type { WorkspaceMemberListItem } from "@/lib/utils/workspace-members";
import { canManageWorkspaceMember } from "@/lib/utils/workspace-permissions";
import type { WorkspaceMemberRole } from "@/types/workspace";
import { MemberCard } from "./member-card";

type MembersGridProps = {
	members: WorkspaceMemberListItem[];
	currentUserId: string;
	viewerRole: WorkspaceMemberRole;
	workspaceSlug: string;
};

export function MembersGrid({
	members,
	currentUserId,
	viewerRole,
	workspaceSlug,
}: MembersGridProps) {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{members.map((member) => (
				<MemberCard
					key={member.id}
					member={member}
					isOnline
					workspaceSlug={workspaceSlug}
					canManage={canManageWorkspaceMember(
						viewerRole,
						member.role,
						member.userId === currentUserId,
					)}
				/>
			))}
		</div>
	);
}
