"use client";

import { useMemo } from "react";
import {
	sortWorkspaceMembers,
	type WorkspaceMemberListItem,
} from "@/lib/utils/workspace-members";
import { MembersGrid } from "./members-grid";
import { MembersHeader } from "./members-header";
import { MembersToolbar } from "./members-toolbar";

type MembersClientProps = {
	members: WorkspaceMemberListItem[];
	currentUserId: string;
	viewerCanManage: boolean;
};

export function MembersClient({
	members,
	currentUserId,
	viewerCanManage,
}: MembersClientProps) {
	const sortedMembers = useMemo(() => sortWorkspaceMembers(members), [members]);

	return (
		<div className="space-y-6">
			<MembersHeader />

			<MembersToolbar />

			<div className="flex items-center justify-between">
				<h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
					Members {sortedMembers.length}
				</h2>
			</div>

			<MembersGrid
				members={sortedMembers}
				currentUserId={currentUserId}
				viewerCanManage={viewerCanManage}
			/>
		</div>
	);
}
