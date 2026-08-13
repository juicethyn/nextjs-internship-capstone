import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceSetupStore } from "@/features/workspace/setup/store";

type InviteMembersHeaderProps = {
	onBack: () => void;
};

export function InviteMembersHeader({ onBack }: InviteMembersHeaderProps) {
	const { workspace } = useWorkspaceSetupStore();

	return (
		<div>
			<Button
				onClick={onBack}
				variant="ghost"
				className="mb-2 p-0 text-muted-foreground"
			>
				<ArrowLeft className="size-4" />
				Back
			</Button>
			<div>
				<h2 className="text-xl lg:text-3xl font-bold">Invite your team</h2>
				<p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-sm">
					Add teammates to{" "}
					<span className="text-foreground">
						{workspace?.name || "your workspace"}
					</span>{" "}
					Workspace. You can also skip this and invite them later.
				</p>
			</div>
		</div>
	);
}
