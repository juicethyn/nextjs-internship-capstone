export type InviteeUser = {
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string | null;
};

// An invite held in the dialog's local state, before Send writes it to the DB.
// user is null when the email has no account yet, which is a normal case.
export type StagedInvite = {
	email: string;
	role: "admin" | "member";
	user: InviteeUser | null;
};
