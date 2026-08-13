"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useInviteMembers } from "@/features/workspace/setup/hooks/use-invite-members";
import { useCurrentUser } from "@/hooks/use-user";
import type { WorkspaceMemberRole } from "@/lib/db/types";

export function InviteMembersForm() {
	const { user } = useCurrentUser();

	const {
		email,
		role,
		error,
		addInvitation,
		updateEmail,
		updateRole,
		handleEmailKeyDown,
	} = useInviteMembers(user?.emailAddresses[0]?.emailAddress ?? "");

	return (
		<div className="space-y-2">
			<label
				htmlFor="invite-email"
				className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			>
				Email Address
			</label>

			<div className="flex flex-col gap-2 sm:flex-row">
				<Input
					id="invite-email"
					value={email}
					onChange={(e) => updateEmail(e.target.value)}
					onKeyDown={(e) => handleEmailKeyDown(e, addInvitation)}
					placeholder="member@example.com"
					className="h-10  bg-muted/40"
				/>

				<Select
					value={role}
					onValueChange={(value) => updateRole(value as WorkspaceMemberRole)}
				>
					<SelectTrigger className="h-10! w-full sm:w-36 bg-muted/40">
						<SelectValue />
					</SelectTrigger>

					<SelectContent>
						<SelectItem className="h-10 w-full" value="member">
							Member
						</SelectItem>
						<SelectItem className="h-10 w-full" value="admin">
							Admin
						</SelectItem>
					</SelectContent>
				</Select>

				<Button
					type="button"
					variant="secondary"
					onClick={addInvitation}
					className="h-10 sm:px-6"
				>
					Add
				</Button>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
