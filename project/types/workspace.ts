export const workspaceMemberRoles = ["owner", "admin", "member"] as const;
export type WorkspaceMemberRole = (typeof workspaceMemberRoles)[number];

export type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;
	color: string;
	logoUrl: string | null;
};
