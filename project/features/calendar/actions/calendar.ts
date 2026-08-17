"use server";

import { getCurrentUser } from "@/lib/auth";
import {
	getCalendarProjects,
	getWorkspaceDeadlines,
} from "@/lib/db/queries/calendar";
import { getVisibleProjectIds } from "@/lib/db/queries/projects";
import { requireWorkspaceMember } from "@/lib/permission";

export async function getCalendarData(workspaceSlug: string) {
	const user = await getCurrentUser();

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

	const [deadlines, projects] = await Promise.all([
		getWorkspaceDeadlines(workspace.id, visibleProjectIds),
		getCalendarProjects(workspace.id, visibleProjectIds),
	]);

	return {
		success: true as const,
		data: {
			deadlines: deadlines.map((row) => ({
				...row,
				dueDate: row.dueDate as Date,
			})),
			projects,
		},
	};
}
