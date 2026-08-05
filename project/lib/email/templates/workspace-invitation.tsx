import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";

type Props = {
	workspaceName: string;
	inviteUrl: string;
};

export function WorkspaceInvitationEmail({ workspaceName, inviteUrl }: Props) {
	return (
		<Html>
			<Head />

			<Preview>You have been invited to join {workspaceName}</Preview>

			<Body>
				<Container>
					<Heading>You're invited to {workspaceName}</Heading>

					<Text>You have been invited to collaborate on a workspace.</Text>

					<Button href={inviteUrl}>Accept Invitation</Button>

					<Text>This invitation expires in 7 days.</Text>
				</Container>
			</Body>
		</Html>
	);
}
