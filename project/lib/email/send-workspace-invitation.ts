import { resend } from "./resend";
import { WorkspaceInvitationEmail } from "./templates/workspace-invitation";

type SendWorkspaceInvitationEmailProps = {
	email: string;
	workspaceName: string;
	token: string;
};

export async function sendWorkspaceInvitationEmail({
	email,
	workspaceName,
	token,
}: SendWorkspaceInvitationEmailProps) {
	const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

	try {
		const { error } = await resend.emails.send({
			from: "Fora <fora@contact.foraapp.me>",
			to: email,
			subject: `You've been invited to ${workspaceName}`,
			react: WorkspaceInvitationEmail({
				workspaceName,
				inviteUrl,
			}),
		});

		if (error) {
			console.error("Resend rejected the invitation email:", error);
			return { success: false };
		}

		return { success: true };
	} catch (error) {
		console.error("Unexpected error sending invitation email:", error);
		return { success: false };
	}
}
