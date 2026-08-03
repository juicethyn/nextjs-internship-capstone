import type { Occupation } from "@/lib/db/schema";
import type { WorkspaceMemberRole } from "../lib/types/workspace";

export interface OnboardingPayload {
	workspace: OnboardingWorkspace;
	invites: OnboardingInvite[];
	occupation: Occupation;
}

export enum OnboardingStep {
	Workspace = 1,
	InviteMembers = 2,
	Profile = 3,
}

export const ONBOARDING_STEPS = [
	{
		id: OnboardingStep.Workspace,
		title: "Workspace",
		description: "Create your workspace",
	},
	{
		id: OnboardingStep.InviteMembers,
		title: "Invite Members",
		description: "Collaborate with your team",
	},
	{
		id: OnboardingStep.Profile,
		title: "Profile",
		description: "Complete your profile",
	},
] as const;

export interface OnboardingWorkspace {
	name: string;
	color: string;
}

export interface OnboardingInvite {
	email: string;
	role: WorkspaceMemberRole;
}
