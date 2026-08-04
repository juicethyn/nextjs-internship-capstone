import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import {
	createWorkspaceAction,
	switchWorkspaceAction,
} from "@/lib/actions/workspaces";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Dialog, DialogContent } from "../ui/dialog";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateWorkspaceModal({ open, onOpenChange }: Props) {
	const router = useRouter();

	const handleComplete = async () => {
		const { workspace, reset } = useOnboardingStore.getState();

		if (!workspace) return;

		const result = await createWorkspaceAction(workspace);

		if (!result.success) {
			return;
		}

		const workspaceSlug = result.data?.slug;

		if (!workspaceSlug) {
			toast.error("Failed to create workspace. Please try again.");
			return;
		}

		await switchWorkspaceAction(workspaceSlug);

		reset();
		onOpenChange(false);

		toast.success(`Workspace ${workspace.name} created successfully!`);
		router.push(`/w/${workspaceSlug}/dashboard`);
	};

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
					onComplete={handleComplete}
				/>
			</DialogContent>
		</Dialog>
	);
}
