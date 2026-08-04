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
		await resend.emails.send({
			from: "Fora <onboarding@resend.dev>",
			to: email,
			subject: `You've been invited to ${workspaceName}`,
			react: WorkspaceInvitationEmail({
				workspaceName,
				inviteUrl,
			}),
		});

		return {
			success: true,
		};
	} catch (error) {
		console.error("Failed to send invitation email:", error);

		return {
			success: false,
		};
	}
}
