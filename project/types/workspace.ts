import type { workspaceLabels } from "@/lib/db/schema";
import type { CreateWorkspaceInput } from "@/lib/validations/workspace";
import type { CreateWorkspaceInvitationInput } from "@/lib/validations/workspaceInvitation";

export type WorkspaceLabel = typeof workspaceLabels.$inferSelect;

export const workspaceMemberRoles = ["owner", "admin", "member"] as const;
export type WorkspaceMemberRole = (typeof workspaceMemberRoles)[number];

export type CreateWorkspacePayload = {
	workspace: CreateWorkspaceInput;
	invites?: CreateWorkspaceInvitationInput[];
};

export type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;
	color: string;
	logoUrl: string | null;
};
