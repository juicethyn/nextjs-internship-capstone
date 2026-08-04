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
import { useInviteMembers } from "@/hooks/use-invite-members";
import type { WorkspaceMemberRole } from "@/types/workspace";

export function InviteMembersForm() {
	const {
		email,
		role,
		error,
		addInvitation,
		updateEmail,
		updateRole,
		handleEmailKeyDown,
	} = useInviteMembers();

	return (
		<div className="space-y-4 rounded-xl border bg-background p-5">
			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="invite-email">
					Email Address
				</label>

				<Input
					value={email}
					onChange={(e) => updateEmail(e.target.value)}
					placeholder="member@example.com"
					id="invite-email"
					onKeyDown={(e) => handleEmailKeyDown(e, addInvitation)}
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium" htmlFor="invite-role">
					Role
				</label>

				<Select
					value={role}
					onValueChange={(value) => updateRole(value as WorkspaceMemberRole)}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="member">Member</SelectItem>

						<SelectItem value="admin">Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Button
				type="button"
				variant="secondary"
				onClick={addInvitation}
				className="w-full"
			>
				Add Invite
			</Button>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
