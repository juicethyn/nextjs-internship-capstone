import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function InviteMembersLists() {
	const { invites, removeInvite } = useOnboardingStore();

	return (
		<>
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
		</>
	);
}
