import type { WorkspaceMemberRole } from "./workspace";

export enum SetupStep {
	Workspace = "workspace",
	InviteMembers = "invite-members",
	Profile = "profile",
}

export type SetupStepConfig = {
	step: SetupStep;
	title: string;
	description: string;
};

export interface SetupWorkspace {
	name: string;
	color: string;
}

export interface SetupInvite {
	email: string;
	role: WorkspaceMemberRole;
}
