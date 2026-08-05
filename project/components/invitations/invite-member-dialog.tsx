import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useInvitationForm } from "@/hooks/use-invitation-form";
import { useWorkspaceInvitations } from "@/hooks/use-workspace-invitations";

export function InviteMemberDialog({
	workspaceSlug,
}: {
	workspaceSlug: string;
}) {
	const form = useInvitationForm();

	const { createInvitation, isLoading } =
		useWorkspaceInvitations(workspaceSlug);

	const handleSubmit = async () => {
		const invite = form.validate();

		if (!invite) return;

		const success = await createInvitation(invite);

		if (success) {
			form.reset();
		}
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button>Invite Member</Button>
			</DialogTrigger>

			<DialogContent>
				<Input
					value={form.email}
					onChange={(e) => form.updateEmail(e.target.value)}
				/>

				<Select value={form.role} onValueChange={form.updateRole} />

				<Button onClick={handleSubmit} disabled={isLoading}>
					Send Invitation
				</Button>
			</DialogContent>
		</Dialog>
	);
}
