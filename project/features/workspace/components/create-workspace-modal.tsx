"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreateWorkspaceFlow } from "@/features/workspace/setup/components/create-workspace-flow";
import { useWorkspaceSetupStore } from "@/features/workspace/setup/store";

type CreateWorkspaceModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateWorkspaceModal({
	open,
	onOpenChange,
}: CreateWorkspaceModalProps) {
	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			useWorkspaceSetupStore.getState().reset();
		}

		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
				<DialogTitle className="sr-only">Create workspace</DialogTitle>
				<DialogDescription className="sr-only">
					Name your workspace and invite your team.
				</DialogDescription>

				<CreateWorkspaceFlow onClose={() => handleOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
