import { Briefcase } from "lucide-react";

export function ProfileHeader() {
	return (
		<div>
			<div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
				<Briefcase className="size-6 text-primary" />
			</div>

			<h2 className="text-3xl font-bold">Tell us about yourself</h2>

			<p className="mt-2 text-sm text-muted-foreground">
				This helps personalize your workspace experience.
			</p>
		</div>
	);
}
