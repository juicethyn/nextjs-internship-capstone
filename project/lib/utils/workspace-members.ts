import { OCCUPATIONS } from "@/constants/workspace";
import type { getWorkspaceMembersWithStatsBySlug } from "@/lib/actions/workspaceMembers";
import type { Occupation } from "@/lib/db/schema";
import type { WorkspaceMemberRole } from "@/types/workspace";
import { memberDisplayName } from "./project-members";

export type WorkspaceMemberListItem = Awaited<
	ReturnType<typeof getWorkspaceMembersWithStatsBySlug>
>["members"][number];

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

export function getWorkspaceRoleLabel(role: WorkspaceMemberRole) {
	return ROLE_LABELS[role];
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
