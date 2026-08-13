import type { CreateWorkspaceInput } from "@/lib/validations/workspace";
import type { CreateWorkspaceInvitationInput } from "@/lib/validations/workspaceInvitation";

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
