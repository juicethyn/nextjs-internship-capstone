"use client";

import { isPresent } from "@/lib/utils/presence";
import type { WorkspaceMemberListItem } from "@/lib/utils/workspace-members";
import { canManageWorkspaceMember } from "@/lib/utils/workspace-permissions";
import type { WorkspaceMemberRole } from "@/types/workspace";
import { MemberCard } from "./member-card";

type MembersGridProps = {
	members: WorkspaceMemberListItem[];
	currentUserId: string;
	viewerRole: WorkspaceMemberRole;
	workspaceSlug: string;
	lastSeenByUserId: Map<string, Date | null>;
};

export function MembersGrid({
	members,
	currentUserId,
	viewerRole,
	workspaceSlug,
	lastSeenByUserId,
}: MembersGridProps) {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{members.map((member) => (
				<MemberCard
					key={member.id}
					member={member}
					workspaceSlug={workspaceSlug}
					// Falls back to the row loaded with the page so the first paint is
					// right, before the first presence poll lands.
					isOnline={isPresent(
						lastSeenByUserId.get(member.userId) ?? member.lastSeenAt,
					)}
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
