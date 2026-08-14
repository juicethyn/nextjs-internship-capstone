"use server";

import { getCurrentUser } from "@/lib/auth";
import { requireWorkspaceMember } from "@/lib/permission";

export async function getDashboardHeaderData(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const viewerRole =
		workspace.members.find((member) => member.userId === user.id)?.role ??
		"member";

	return {
		success: true as const,
		data: {
			workspaceName: workspace.name,
			viewerRole,
		},
	};
}
