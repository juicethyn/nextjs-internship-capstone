export const invitationStatus = [
	"pending",
	"accepted",
	"declined",
	"expired",
] as const;

export type InvitationStatus = (typeof invitationStatus)[number];
