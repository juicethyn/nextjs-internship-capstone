export const invitationStatus = [
	"pending",
	"accepted",
	"declined",
	"revoked",
	"expired",
] as const;

export type InvitationStatus = (typeof invitationStatus)[number];
