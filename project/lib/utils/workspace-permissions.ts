import type { WorkspaceMemberRole } from "@/types/workspace";

export const WORKSPACE_MEMBER_FORBIDDEN_MESSAGE =
	"You do not have permission to manage this member.";

export function canManageWorkspaceMember(
	viewerRole: WorkspaceMemberRole,
	targetRole: WorkspaceMemberRole,
	isSelf: boolean,
) {
	if (isSelf) return false;

	if (targetRole === "owner") return false;

	if (viewerRole === "owner") return true;

	return viewerRole === "admin" && targetRole === "member";
}
