import type { Occupation } from "@/lib/db/schema";
import type { WorkspaceMemberRole } from "../types/workspace";

export interface OnboardingPayload {
	workspace: OnboardingWorkspace;
	invites: OnboardingInvite[];
	occupation: Occupation;
}

export enum OnboardingStep {
	Workspace = "workspace",
	InviteMembers = "invite-members",
	Profile = "profile",
}

export type OnboardingStepConfig = {
	id: number;
	step: OnboardingStep;
	title: string;
	description: string;
};

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
	{
		id: 1,
		step: OnboardingStep.Workspace,
		title: "Workspace",
		description: "Create your workspace",
	},
	{
		id: 2,
		step: OnboardingStep.InviteMembers,
		title: "Invite Members",
		description: "Collaborate with your team",
	},
	{
		id: 3,
		step: OnboardingStep.Profile,
		title: "Profile",
		description: "Complete your profile",
	},
];

export const ONBOARDING_FLOWS = {
	onboarding: ONBOARDING_STEPS,

	createWorkspace: [ONBOARDING_STEPS[0], ONBOARDING_STEPS[1]],
} satisfies Record<string, OnboardingStepConfig[]>;

export interface OnboardingWorkspace {
	name: string;
	color: string;
}

export interface OnboardingInvite {
	email: string;
	role: WorkspaceMemberRole;
}
