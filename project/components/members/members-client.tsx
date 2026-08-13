"use client";

import { useMemo } from "react";
import { WorkspaceInviteDialog } from "@/components/invitations/workspace-invite-dialog";
import { useWorkspaceInvitations } from "@/hooks/use-workspace-invitations";
import {
	useWorkspaceMembersStats,
	type WorkspaceMembersStats,
} from "@/hooks/use-workspace-members-stats";
import { useWorkspacePresence } from "@/hooks/use-workspace-presence";
import { sortWorkspaceMembers } from "@/lib/utils/workspace-members";
import { useUIStore } from "@/stores/ui-store";
import { MembersGrid } from "./members-grid";
import { MembersHeader } from "./members-header";
import { MembersToolbar } from "./members-toolbar";
import { PendingMemberCard } from "./pending-member-card";

type MembersClientProps = {
	workspaceSlug: string;
	initialData: WorkspaceMembersStats;
};

export function MembersClient({
	workspaceSlug,
	initialData,
}: MembersClientProps) {
	const openWorkspaceInvite = useUIStore((state) => state.openWorkspaceInvite);

	const { data } = useWorkspaceMembersStats({ workspaceSlug, initialData });

	const {
		revokeInvitation,
		revokingInvitationId,
		resendInvitation,
		resendingInvitationId,
	} = useWorkspaceInvitations(workspaceSlug);

	const { lastSeenByUserId } = useWorkspacePresence(workspaceSlug);

	const sortedMembers = useMemo(
		() => sortWorkspaceMembers(data.members),
		[data.members],
	);

	// Derived from query data rather than a server-computed prop, so a refetch
	// that changes the viewer's role updates the UI with it.
	const viewerCanManage =
		data.viewerRole === "owner" || data.viewerRole === "admin";

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
				currentUserId={data.currentUserId}
				viewerRole={data.viewerRole}
				workspaceSlug={workspaceSlug}
				lastSeenByUserId={lastSeenByUserId}
			/>

			{data.pendingInvitations.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
							Pending {data.pendingInvitations.length}
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
						{data.pendingInvitations.map((invitation) => (
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
				workspaceName={data.workspaceName}
			/>
		</div>
	);
}
