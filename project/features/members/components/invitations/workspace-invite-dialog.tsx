"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { findWorkspaceInviteeByEmailAction } from "@/features/members/actions/workspaceInvitations";
import { useInvitationForm } from "@/features/members/hooks/use-invitation-form";
import { useWorkspaceInvitations } from "@/features/members/hooks/use-workspace-invitations";
import { useMemberUIStore } from "@/features/members/store";
import type { StagedInvite } from "@/features/members/types";
import { StagedInviteRow } from "./staged-invite-row";

type WorkspaceInviteDialogProps = {
	workspaceSlug: string;
	workspaceName: string;
};

export function WorkspaceInviteDialog({
	workspaceSlug,
	workspaceName,
}: WorkspaceInviteDialogProps) {
	const isOpen = useMemberUIStore((state) => state.isWorkspaceInviteOpen);
	const setOpen = useMemberUIStore((state) => state.setWorkspaceInviteOpen);

	const form = useInvitationForm();

	const [staged, setStaged] = useState<StagedInvite[]>([]);
	const [isResolving, startResolving] = useTransition();

	const { sendInvitations, isSending } = useWorkspaceInvitations(workspaceSlug);

	const isBusy = isResolving || isSending;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setStaged([]);
			form.reset();
		}

		setOpen(open);
	};

	const handleAdd = () => {
		const invite = form.validate();

		if (!invite) return;

		const email = invite.email.trim().toLowerCase();

		if (staged.some((item) => item.email === email)) {
			form.setError("This email is already in the list below.");
			return;
		}

		startResolving(async () => {
			const result = await findWorkspaceInviteeByEmailAction(
				workspaceSlug,
				email,
			);

			if (!result.success) {
				form.setError(result.message);
				return;
			}

			setStaged((current) => [
				...current,
				{
					email: result.data.email,
					role: invite.role === "owner" ? "member" : invite.role,
					user: result.data.user,
				},
			]);

			form.reset();
		});
	};

	const handleRemove = (email: string) => {
		setStaged((current) => current.filter((item) => item.email !== email));
	};

	const handleSend = async () => {
		const result = await sendInvitations(
			staged.map(({ email, role }) => ({ email, role })),
		);

		if ("message" in result && result.message) return;

		const failedEmails = new Set(
			result.results.filter((entry) => !entry.success).map((e) => e.email),
		);

		if (failedEmails.size === 0) {
			handleOpenChange(false);
			return;
		}

		setStaged((current) =>
			current.filter((item) => failedEmails.has(item.email)),
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[85vh] min-w-0 flex-col gap-0 p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 text-left">
					<DialogTitle className="text-base">Invite members</DialogTitle>

					<DialogDescription className="text-xs leading-relaxed">
						Invite people to {workspaceName}. They get an email with a link that
						expires in 7 days.
					</DialogDescription>
				</DialogHeader>

				<div className="board-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
					<div className="space-y-2">
						<label
							htmlFor="workspace-invite-email"
							className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
						>
							Email address
						</label>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								id="workspace-invite-email"
								type="email"
								value={form.email}
								onChange={(event) => form.updateEmail(event.target.value)}
								onKeyDown={(event) => form.handleEmailKeyDown(event, handleAdd)}
								placeholder="member@example.com"
								disabled={isBusy}
								className="flex-1"
							/>

							<Select
								value={form.role}
								onValueChange={(value) =>
									form.updateRole(value as "admin" | "member")
								}
								disabled={isBusy}
							>
								<SelectTrigger className="w-full sm:w-32">
									<SelectValue />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>

							<Button
								type="button"
								variant="secondary"
								onClick={handleAdd}
								disabled={isBusy || form.email.trim().length === 0}
								className="sm:px-6"
							>
								{isResolving ? "Adding..." : "Add"}
							</Button>
						</div>

						{form.error && (
							<p className="text-xs text-destructive">{form.error}</p>
						)}
					</div>

					<section className="min-w-0 space-y-1">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Invited members ({staged.length})
						</h3>

						{staged.length === 0 ? (
							<p className="rounded-lg p-6 text-center text-sm text-muted-foreground">
								No one added yet. Enter an email above and press Add.
							</p>
						) : (
							<ul className="min-w-0 divide-y">
								{staged.map((invite) => (
									<li key={invite.email} className="min-w-0">
										<StagedInviteRow
											invite={invite}
											onRemove={() => handleRemove(invite.email)}
											disabled={isSending}
										/>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<div className="flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => handleOpenChange(false)}
						disabled={isSending}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>

					<Button
						type="button"
						size="sm"
						onClick={handleSend}
						disabled={staged.length === 0 || isBusy}
						className="w-full sm:w-auto"
					>
						{isSending
							? "Sending..."
							: staged.length <= 1
								? "Send invitation"
								: `Send ${staged.length} invitations`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
