import { getCurrentUser } from "../auth";
import { getLabelsByWorkspace } from "../db/queries/workspaceLabels";
import { requireWorkspaceMember } from "../permission";

export async function getLabelsByWorkspaceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const labels = await getLabelsByWorkspace(workspace.id);

	return labels;
}

export async function createLabelAction() {}

export async function updateLabelAction() {}

export async function deleteLabelAction() {}
