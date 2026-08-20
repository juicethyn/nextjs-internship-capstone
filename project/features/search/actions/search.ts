"use server";

import { MIN_SEARCH_LENGTH } from "@/features/search/constants";
import { getCurrentUser } from "@/lib/auth";
import { getVisibleProjectIds } from "@/lib/db/queries/projects";
import {
	searchMembers,
	searchProjects,
	searchTasks,
	toSearchPattern,
} from "@/lib/db/queries/search";
import { requireWorkspaceMember } from "@/lib/permission";

const EMPTY_RESULTS = {
	projects: [],
	tasks: [],
	members: [],
};

export async function searchWorkspaceAction(
	workspaceSlug: string,
	term: string,
) {
	const user = await getCurrentUser();

	const trimmed = term.trim();

	if (trimmed.length < MIN_SEARCH_LENGTH) {
		return { success: true as const, data: EMPTY_RESULTS };
	}

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	const isWorkspaceManager = viewerRole === "owner" || viewerRole === "admin";

	const visibleProjectIds = await getVisibleProjectIds(
		workspace.id,
		user.id,
		isWorkspaceManager,
	);

	const pattern = toSearchPattern(trimmed);

	const [projects, tasks, members] = await Promise.all([
		searchProjects(visibleProjectIds, pattern),
		searchTasks(visibleProjectIds, pattern),
		searchMembers(workspace.id, pattern),
	]);

	return {
		success: true as const,
		data: { projects, tasks, members },
	};
}
