"use client";

import { CREATE_WORKSPACE_STEPS } from "@/constants/workspace-setup";
import { useCreateWorkspace } from "@/hooks/use-create-workspace";
import { useStepFlow } from "@/hooks/use-step-flow";
import { SetupStep } from "@/types/workspace-setup";
import { InviteMembersStep } from "./invite-members/invite-members-step";
import { SetupLayout } from "./setup-layout";
import { WorkspaceStep } from "./workspace-step";

type CreateWorkspaceFlowProps = {
	onClose: () => void;
};

export function CreateWorkspaceFlow({ onClose }: CreateWorkspaceFlowProps) {
	const { step, index, next, back } = useStepFlow(CREATE_WORKSPACE_STEPS);
	const { createWorkspace, isCreating } = useCreateWorkspace();

	return (
		<SetupLayout
			steps={CREATE_WORKSPACE_STEPS}
			currentIndex={index}
			onClose={onClose}
		>
			{step.step === SetupStep.Workspace && <WorkspaceStep onNext={next} />}

			{step.step === SetupStep.InviteMembers && (
				<InviteMembersStep
					onBack={back}
					onContinue={createWorkspace}
					onSkip={createWorkspace}
					continueLabel="Create workspace"
					isSubmitting={isCreating}
				/>
			)}
		</SetupLayout>
	);
}
