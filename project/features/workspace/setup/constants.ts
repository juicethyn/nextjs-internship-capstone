import {
	SetupStep,
	type SetupStepConfig,
} from "@/features/workspace/setup/types";

const WORKSPACE_STEP: SetupStepConfig = {
	step: SetupStep.Workspace,
	title: "Workspace",
	description: "Create your workspace",
};

const INVITE_MEMBERS_STEP: SetupStepConfig = {
	step: SetupStep.InviteMembers,
	title: "Invite Members",
	description: "Collaborate with your team",
};

const PROFILE_STEP: SetupStepConfig = {
	step: SetupStep.Profile,
	title: "Profile",
	description: "Complete your profile",
};

export const ONBOARDING_STEPS: SetupStepConfig[] = [
	WORKSPACE_STEP,
	INVITE_MEMBERS_STEP,
	PROFILE_STEP,
];

export const CREATE_WORKSPACE_STEPS: SetupStepConfig[] = [
	WORKSPACE_STEP,
	INVITE_MEMBERS_STEP,
];
