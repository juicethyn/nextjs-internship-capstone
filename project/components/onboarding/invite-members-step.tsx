"use client";

import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WorkspaceMemberRole } from "@/lib/types/workspace";
import { createWorkspaceInvitationSchema } from "@/lib/validations/workspaceInvitation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ONBOARDING_STEPS } from "@/types/onboarding";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

type Props = {
	onBack: () => void;
	onNext: () => void;
	currentStep: number;
};

export function InviteMembersStep({ onBack, onNext, currentStep }: Props) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<WorkspaceMemberRole>("member");
	const [error, setError] = useState<string | null>(null);

	const { invites, addInvite, removeInvite } = useOnboardingStore();

	const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;

		e.preventDefault();

		handleAddInvite();
	};

	const handleAddInvite = () => {
		const result = createWorkspaceInvitationSchema.safeParse({
			email,
			role,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);

			return;
		}

		const alreadyExists = invites.some((invite) => invite.email === email);

		if (alreadyExists) {
			setError("This email has already been invited.");

			return;
		}

		addInvite(result.data);

		setEmail("");
		setError(null);
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
					<UserPlus className="size-6 text-primary" />
				</div>

				<h2 className="text-3xl font-bold tracking-tight">Invite your team</h2>

				<p className="mt-2 text-sm text-muted-foreground">
					Add teammates who will collaborate with you. You can skip this step
					and invite them later.
				</p>
			</div>

			{/* Invite Form */}
			<div className="space-y-4 rounded-xl border bg-background p-5">
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="invite-email">
						Email Address
					</label>

					<Input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onKeyDown={handleEmailKeyDown}
						placeholder="member@example.com"
						id="invite-email"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="invite-role">
						Role
					</label>

					<Select
						value={role}
						onValueChange={(value) => setRole(value as WorkspaceMemberRole)}
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
					onClick={handleAddInvite}
					className="w-full"
				>
					Add Invite
				</Button>

				{error && <p className="text-sm text-destructive">{error}</p>}
			</div>

			{/* Invite List */}
			{invites.length > 0 && (
				<div className="space-y-3">
					<p className="text-sm font-medium">Invited Members</p>

					<div className="space-y-2">
						{invites.map((invite) => (
							<div
								key={invite.email}
								className="
									flex
									items-center
									justify-between
									rounded-lg
									border
									bg-muted/30
									p-3
								"
							>
								<div>
									<p className="text-sm font-medium">{invite.email}</p>

									<p className="text-xs capitalize text-muted-foreground">
										{invite.role}
									</p>
								</div>

								<Button
									size="icon"
									variant="ghost"
									onClick={() => removeInvite(invite.email)}
								>
									<X className="size-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>

				<Button onClick={onNext}>
					{invites.length > 0 ? "Continue" : "Skip & Continue"}
				</Button>
			</div>
		</div>
	);
}
