"use client";

import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import { useCreateWorkspace } from "@/hooks/use-create-workspace";
import { Dialog, DialogContent } from "../ui/dialog";

type CreateWorkspaceModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateWorkspaceModal({
	open,
	onOpenChange,
}: CreateWorkspaceModalProps) {
	const { createWorkspace, isCreating } = useCreateWorkspace();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="
					fixed
					inset-0
					z-50
					h-screen
					w-screen
					max-w-none
					translate-x-0
					translate-y-0
					rounded-none
					border-none
					bg-background
					p-0
				"
				showCloseButton={false}
			>
				<OnboardingContainer
					mode="createWorkspace"
					onClose={() => onOpenChange(false)}
					onComplete={createWorkspace}
					isSubmitting={isCreating}
				/>
			</DialogContent>
		</Dialog>
	);
}
