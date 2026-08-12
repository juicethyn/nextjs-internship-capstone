"use client";

import { useMemo } from "react";
import { WorkspaceInviteDialog } from "@/components/invitations/workspace-invite-dialog";
import { useWorkspaceInvitations } from "@/hooks/use-workspace-invitations";
import {
	type PendingInvitationListItem,
	sortWorkspaceMembers,
	type WorkspaceMemberListItem,
} from "@/lib/utils/workspace-members";
import { useUIStore } from "@/stores/ui-store";
import { MembersGrid } from "./members-grid";
import { MembersHeader } from "./members-header";
import { MembersToolbar } from "./members-toolbar";
import { PendingMemberCard } from "./pending-member-card";

type MembersClientProps = {
	members: WorkspaceMemberListItem[];
	pendingInvitations: PendingInvitationListItem[];
	currentUserId: string;
	viewerCanManage: boolean;
	workspaceSlug: string;
	workspaceName: string;
};

export function MembersClient({
	members,
	pendingInvitations,
	currentUserId,
	viewerCanManage,
	workspaceSlug,
	workspaceName,
}: MembersClientProps) {
	const openWorkspaceInvite = useUIStore((state) => state.openWorkspaceInvite);

	const {
		revokeInvitation,
		revokingInvitationId,
		resendInvitation,
		resendingInvitationId,
	} = useWorkspaceInvitations(workspaceSlug);

	const sortedMembers = useMemo(() => sortWorkspaceMembers(members), [members]);

	return (
		<div className="space-y-6">
			<MembersHeader
				canInvite={viewerCanManage}
				onInvite={openWorkspaceInvite}
			/>

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

			{pendingInvitations.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
							Pending {pendingInvitations.length}
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{pendingInvitations.map((invitation) => (
							<PendingMemberCard
								key={invitation.id}
								invitation={invitation}
								canManage={viewerCanManage}
								isBusy={
									revokingInvitationId === invitation.id ||
									resendingInvitationId === invitation.id
								}
								onResend={() => resendInvitation(invitation.id)}
								onRevoke={() => revokeInvitation(invitation.id)}
							/>
						))}
					</div>
				</>
			)}

			<WorkspaceInviteDialog
				workspaceSlug={workspaceSlug}
				workspaceName={workspaceName}
			/>
		</div>
	);
}
