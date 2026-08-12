import { UserPlus } from "lucide-react";
import { Button } from "../ui/button";

export function MembersHeader() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Team Members</h1>

				<p className="text-sm text-muted-foreground">
					Manage who has access to this workspace and what they can do.
				</p>
			</div>

			<Button size="lg" className="w-full sm:w-auto">
				<UserPlus className="size-4" />
				Invite Member
			</Button>
		</div>
	);
}
