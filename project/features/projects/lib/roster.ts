import type { ProjectDetail } from "@/features/projects/types";
import type { getWorkspaceMembersById } from "@/lib/db/queries/workspaceMembers";
import { memberDisplayName } from "@/lib/user-display";

export type WorkspaceMemberWithUser = Awaited<
	ReturnType<typeof getWorkspaceMembersById>
>[number];

type RosterUser = ProjectDetail["members"][number]["user"];

export type ProjectRosterEntry = {
	userId: string;
	user: RosterUser;
	isLead: boolean;
};

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
