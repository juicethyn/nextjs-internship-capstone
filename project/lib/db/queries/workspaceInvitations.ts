import { and, eq } from "drizzle-orm";
import type {
	CreateWorkspaceInvitationInput,
	UpdateWorkspaceInvitationInput,
} from "@/lib/validations/workspaceInvitation";
import { db } from "../index";
import { workspaceInvitations } from "../schema";

export function getWorkspaceInvitations(workspaceId: string) {
	return db.query.workspaceInvitations.findMany({
		where: eq(workspaceInvitations.workspaceId, workspaceId),
		orderBy: (invitation, { desc }) => desc(invitation.createdAt),
	});
}

export function getWorkspaceInvitationById(id: string) {
	return db.query.workspaceInvitations.findFirst({
		where: eq(workspaceInvitations.id, id),
	});
}

// Prevents Duplicate Invitations
export function getWorkspaceInvitationByEmail(
	workspaceId: string,
	email: string,
) {
	return db.query.workspaceInvitations.findFirst({
		where: and(
			eq(workspaceInvitations.workspaceId, workspaceId),
			eq(workspaceInvitations.email, email),
			eq(workspaceInvitations.status, "pending"),
		),
	});
}

export function getWorkspaceInvitationByToken(token: string) {
	return db.query.workspaceInvitations.findFirst({
		where: eq(workspaceInvitations.token, token),
	});
}

export async function createWorkspaceInvitation(
	data: CreateWorkspaceInvitationInput & {
		workspaceId: string;
		invitedById: string;
		token: string;
		expiresAt: Date;
	},
) {
	const [invitation] = await db
		.insert(workspaceInvitations)
		.values({
			...data,
			status: "pending",
		})
		.returning();

	return invitation;
}

export async function updateWorkspaceInvitation(
	id: string,
	data: UpdateWorkspaceInvitationInput,
) {
	const [invitation] = await db
		.update(workspaceInvitations)
		.set(data)
		.where(eq(workspaceInvitations.id, id))
		.returning();

	return invitation;
}
