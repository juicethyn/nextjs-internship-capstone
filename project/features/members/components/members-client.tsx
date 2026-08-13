"use client";

import { useMemo, useState } from "react";
import { WorkspaceInviteDialog } from "@/features/members/components/invitations/workspace-invite-dialog";
import { useWorkspaceInvitations } from "@/features/members/hooks/use-workspace-invitations";
import {
	useWorkspaceMembersStats,
	type WorkspaceMembersStats,
} from "@/features/members/hooks/use-workspace-members-stats";
import { useWorkspacePresence } from "@/features/members/hooks/use-workspace-presence";
import {
	DEFAULT_MEMBER_ROLE_FILTER,
	DEFAULT_MEMBER_STATUS_FILTER,
	filterPendingInvitations,
	filterWorkspaceMembers,
	sortWorkspaceMembers,
	type WorkspaceMemberListItem,
	type WorkspaceMemberRoleFilter,
	type WorkspaceMemberStatusFilter,
} from "@/features/members/lib/member-filters";
import { isPresent } from "@/features/members/lib/presence";
import { useMemberUIStore } from "@/features/members/store";
import { MembersEmptyState } from "./members-empty-state";
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
	const openWorkspaceInvite = useMemberUIStore(
		(state) => state.openWorkspaceInvite,
	);

	const { data } = useWorkspaceMembersStats({ workspaceSlug, initialData });

	const {
		revokeInvitation,
		revokingInvitationId,
		resendInvitation,
		resendingInvitationId,
	} = useWorkspaceInvitations(workspaceSlug);

	const { lastSeenByUserId } = useWorkspacePresence(workspaceSlug);

	const [search, setSearch] = useState("");
	const [role, setRole] = useState<WorkspaceMemberRoleFilter>(
		DEFAULT_MEMBER_ROLE_FILTER,
	);
	const [status, setStatus] = useState<WorkspaceMemberStatusFilter>(
		DEFAULT_MEMBER_STATUS_FILTER,
	);

	const isOnline = useMemo(
		() => (member: WorkspaceMemberListItem) =>
			isPresent(lastSeenByUserId.get(member.userId) ?? member.lastSeenAt),
		[lastSeenByUserId],
	);

	const visibleMembers = useMemo(
		() =>
			sortWorkspaceMembers(
				filterWorkspaceMembers(data.members, {
					search,
					role,
					status,
					isOnline,
				}),
			),
		[data.members, search, role, status, isOnline],
	);

	const visiblePendingInvitations = useMemo(
		() =>
			status === "all"
				? filterPendingInvitations(data.pendingInvitations, { search, role })
				: [],
		[data.pendingInvitations, search, role, status],
	);

	const viewerCanManage =
		data.viewerRole === "owner" || data.viewerRole === "admin";

	const hasFilters =
		search.trim() !== "" ||
		role !== DEFAULT_MEMBER_ROLE_FILTER ||
		status !== DEFAULT_MEMBER_STATUS_FILTER;

	const clearFilters = () => {
		setSearch("");
		setRole(DEFAULT_MEMBER_ROLE_FILTER);
		setStatus(DEFAULT_MEMBER_STATUS_FILTER);
	};

	const hasNoResults =
		visibleMembers.length === 0 && visiblePendingInvitations.length === 0;

	return (
		<div className="space-y-6">
			<MembersHeader
				canInvite={viewerCanManage}
				onInvite={openWorkspaceInvite}
			/>

			<MembersToolbar
				search={search}
				onSearchChange={setSearch}
				role={role}
				onRoleChange={setRole}
				status={status}
				onStatusChange={setStatus}
			/>

			{hasNoResults ? (
				<MembersEmptyState onClearFilters={clearFilters} />
			) : (
				<>
					{visibleMembers.length > 0 && (
						<>
							<div className="flex items-center justify-between">
								<h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
									Members {visibleMembers.length}
									{hasFilters && ` of ${data.members.length}`}
								</h2>
							</div>

							<MembersGrid
								members={visibleMembers}
								currentUserId={data.currentUserId}
								viewerRole={data.viewerRole}
								workspaceSlug={workspaceSlug}
								lastSeenByUserId={lastSeenByUserId}
							/>
						</>
					)}

					{visiblePendingInvitations.length > 0 && (
						<>
							<div className="flex items-center justify-between">
								<h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
									Pending {visiblePendingInvitations.length}
								</h2>
							</div>

							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
								{visiblePendingInvitations.map((invitation) => (
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
				</>
			)}

			<WorkspaceInviteDialog
				workspaceSlug={workspaceSlug}
				workspaceName={data.workspaceName}
			/>
		</div>
	);
}
