// export const workspaceRoles = ["owner", "admin", "member"] as const;

export const workspaceMemberRoles = ["owner", "admin", "member"] as const;

// export type WorkspaceRole = (typeof workspaceRoles)[number];

export type WorkspaceMemberRole = (typeof workspaceMemberRoles)[number];
