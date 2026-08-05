import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
	onBack: () => void;
};

export function ProfileHeader({ onBack }: ProfileHeaderProps) {
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
				<h2 className="text-xl lg:text-3xl font-bold">
					Tell us about yourself
				</h2>
				<p className="mt-1 text-sm text-muted-foreground lg:mt-2 lg:text-sm">
					This helps personalize your workspace experience.
				</p>
			</div>
		</div>
	);
}
