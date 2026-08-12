"use client";

import type { WorkspaceMemberListItem } from "@/lib/utils/workspace-members";
import { MemberCard } from "./member-card";

type MembersGridProps = {
	members: WorkspaceMemberListItem[];
	currentUserId: string;
	viewerCanManage: boolean;
};

export function MembersGrid({
	members,
	currentUserId,
	viewerCanManage,
}: MembersGridProps) {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{members.map((member) => (
				<MemberCard
					key={member.id}
					member={member}
					isOnline
					canManage={
						viewerCanManage &&
						member.role !== "owner" &&
						member.userId !== currentUserId
					}
				/>
			))}
		</div>
	);
}
