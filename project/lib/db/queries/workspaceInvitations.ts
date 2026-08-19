import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/lib/db/types";
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

export function getPendingWorkspaceInvitations(workspaceId: string) {
	return db.query.workspaceInvitations.findMany({
		where: and(
			eq(workspaceInvitations.workspaceId, workspaceId),
			eq(workspaceInvitations.status, "pending"),
		),
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
		with: {
			workspace: true,
			invitedBy: true,
		},
	});
}

export async function createWorkspaceInvitation(
	data: CreateWorkspaceInvitationInput & {
		workspaceId: string;
		invitedById: string;
		token: string;
		expiresAt: Date;
	},
	dbClient: DbClient = db,
) {
	const [invitation] = await dbClient
		.insert(workspaceInvitations)
		.values({
			...data,
			status: "pending",
		})
		.onConflictDoUpdate({
			target: [workspaceInvitations.workspaceId, workspaceInvitations.email],
			set: {
				role: data.role,
				// A fresh token retires the previous link, so a revoked invite's URL
				// stays dead even though the row is being reused.
				token: data.token,
				status: "pending",
				invitedById: data.invitedById,
				expiresAt: data.expiresAt,
				createdAt: new Date(),
			},
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
