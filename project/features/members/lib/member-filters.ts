import type { getWorkspaceMembersWithStatsBySlug } from "@/features/members/actions/workspaceMembers";
import { OCCUPATIONS } from "@/lib/db/constants";
import type { Occupation } from "@/lib/db/schema";
import type { WorkspaceMemberRole } from "@/lib/db/types";
import { memberDisplayName } from "@/lib/user-display";

type MembersPayload = Extract<
	Awaited<ReturnType<typeof getWorkspaceMembersWithStatsBySlug>>,
	{ success: true }
>["data"];

export type WorkspaceMemberListItem = MembersPayload["members"][number];

export type PendingInvitationListItem =
	MembersPayload["pendingInvitations"][number];

export type WorkspaceMemberRoleFilter = "all" | WorkspaceMemberRole;

export type WorkspaceMemberStatusFilter = "all" | "online" | "offline";

export const WORKSPACE_ROLE_STYLES = {
	owner: {
		bg: "bg-violet-100 dark:bg-violet-500/15",
		text: "text-violet-700 dark:text-violet-400",
		dot: "bg-violet-500",
		border: "border-violet-200 dark:border-violet-500/20",
	},
	admin: {
		bg: "bg-blue-100 dark:bg-blue-500/15",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
		border: "border-blue-200 dark:border-blue-500/20",
	},
	member: {
		bg: "bg-muted",
		text: "text-muted-foreground",
		dot: "bg-muted-foreground",
		border: "border-border",
	},
} as const satisfies Record<
	WorkspaceMemberRole,
	{ bg: string; text: string; dot: string; border: string }
>;

const ROLE_LABELS: Record<WorkspaceMemberRole, string> = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
};

const ROLE_ORDER: Record<WorkspaceMemberRole, number> = {
	owner: 0,
	admin: 1,
	member: 2,
};

export const MEMBER_ROLE_FILTER_OPTIONS = [
	{ value: "all", label: "All roles" },
	{ value: "owner", label: "Owner" },
	{ value: "admin", label: "Admin" },
	{ value: "member", label: "Member" },
] as const satisfies readonly {
	value: WorkspaceMemberRoleFilter;
	label: string;
}[];

export const MEMBER_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "online", label: "Online" },
	{ value: "offline", label: "Offline" },
] as const satisfies readonly {
	value: WorkspaceMemberStatusFilter;
	label: string;
}[];

export const DEFAULT_MEMBER_ROLE_FILTER: WorkspaceMemberRoleFilter = "all";

export const DEFAULT_MEMBER_STATUS_FILTER: WorkspaceMemberStatusFilter = "all";

export function getWorkspaceRoleLabel(role: WorkspaceMemberRole) {
	return ROLE_LABELS[role];
}

function matchesSearch(
	haystacks: (string | null | undefined)[],
	normalizedQuery: string,
) {
	if (normalizedQuery === "") return true;

	return haystacks.some((value) =>
		value?.toLowerCase().includes(normalizedQuery),
	);
}

type MemberFilters = {
	search: string;
	role: WorkspaceMemberRoleFilter;
	status: WorkspaceMemberStatusFilter;
	// Presence lives in a separate polled query, so the caller resolves it and
	// this stays a pure function of its inputs.
	isOnline: (member: WorkspaceMemberListItem) => boolean;
};

export function filterWorkspaceMembers(
	members: WorkspaceMemberListItem[],
	{ search, role, status, isOnline }: MemberFilters,
) {
	const normalizedQuery = search.trim().toLowerCase();

	return members.filter((member) => {
		if (role !== "all" && member.role !== role) return false;

		if (status !== "all" && isOnline(member) !== (status === "online")) {
			return false;
		}

		return matchesSearch(
			[memberDisplayName(member.user), member.user.email],
			normalizedQuery,
		);
	});
}

// Pending invitees have no presence, so the status filter can't apply to them —
// MembersClient hides the whole section when a status is selected rather than
// pretending an invitation is offline.
export function filterPendingInvitations(
	invitations: PendingInvitationListItem[],
	{ search, role }: Pick<MemberFilters, "search" | "role">,
) {
	const normalizedQuery = search.trim().toLowerCase();

	return invitations.filter((invitation) => {
		if (role !== "all" && invitation.role !== role) return false;

		return matchesSearch(
			[
				invitation.email,
				invitation.user ? memberDisplayName(invitation.user) : null,
			],
			normalizedQuery,
		);
	});
}

export function getOccupationLabel(occupation: Occupation | null) {
	if (!occupation) return null;

	return (
		OCCUPATIONS.find((option) => option.value === occupation)?.label ?? null
	);
}

// Owner first, then admins, then members — alphabetical within each tier.
export function sortWorkspaceMembers(members: WorkspaceMemberListItem[]) {
	return [...members].sort((a, b) => {
		const byRole = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];

		if (byRole !== 0) return byRole;

		return memberDisplayName(a.user).localeCompare(
			memberDisplayName(b.user),
			undefined,
			{ sensitivity: "base" },
		);
	});
}
