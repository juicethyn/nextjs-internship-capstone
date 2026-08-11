import type { getWorkspaceMembersById } from "@/lib/db/queries/workspaceMembers";
import type { ProjectDetail } from "@/types/projects";

export type WorkspaceMemberWithUser = Awaited<
	ReturnType<typeof getWorkspaceMembersById>
>[number];

type RosterUser = ProjectDetail["members"][number]["user"];

export type ProjectRosterEntry = {
	userId: string;
	user: RosterUser;
	isLead: boolean;
};

export function memberDisplayName(user: {
	firstName: string;
	lastName: string;
	email: string;
}) {
	const fullName = [user.firstName, user.lastName]
		.filter(Boolean)
		.join(" ")
		.trim();

	return fullName || user.email;
}

export function getProjectRoleLabel(isLead: boolean) {
	return isLead ? "Project Lead" : "Member";
}

// Lead first, then alphabetical. The lead is included even when their project_members row is missing, so they never vanish from the list.
export function getProjectRoster(project: ProjectDetail): ProjectRosterEntry[] {
	const entries: ProjectRosterEntry[] = project.members.map((member) => ({
		userId: member.userId,
		user: member.user,
		isLead: member.userId === project.leadId,
	}));

	const hasLeadEntry = entries.some((entry) => entry.isLead);

	if (!hasLeadEntry && project.leadId && project.lead) {
		entries.push({
			userId: project.leadId,
			user: project.lead,
			isLead: true,
		});
	}

	return entries.sort((a, b) => {
		if (a.isLead !== b.isLead) {
			return a.isLead ? -1 : 1;
		}

		return memberDisplayName(a.user).localeCompare(memberDisplayName(b.user));
	});
}

export function getAvailableWorkspaceMembers(
	workspaceMembers: WorkspaceMemberWithUser[],
	roster: ProjectRosterEntry[],
) {
	const rosterUserIds = new Set(roster.map((entry) => entry.userId));

	return workspaceMembers
		.filter((member) => !rosterUserIds.has(member.userId))
		.sort((a, b) =>
			memberDisplayName(a.user).localeCompare(memberDisplayName(b.user)),
		);
}

export function filterMembersBySearch<T extends { user: RosterUser }>(
	members: T[],
	search: string,
) {
	const term = search.trim().toLowerCase();

	if (!term) {
		return members;
	}

	return members.filter(
		(member) =>
			memberDisplayName(member.user).toLowerCase().includes(term) ||
			member.user.email.toLowerCase().includes(term),
	);
}

export function getInitials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
