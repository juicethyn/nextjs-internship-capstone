import { and, eq, inArray } from "drizzle-orm";
import type { DbClient, WorkspaceMemberRole } from "@/lib/db/types";
import type { CreateWorkspaceMemberInput } from "@/lib/validations/workspaceMember";
import { db } from "../index";
import { workspaceMembers, workspaces } from "../schema";

export async function getWorkspaceMembersById(workspaceId: string) {
	return db.query.workspaceMembers.findMany({
		where: eq(workspaceMembers.workspaceId, workspaceId),
		with: {
			user: true,
		},
	});
}

export async function getWorkspaceMemberById(
	workspaceId: string,
	userId: string,
) {
	return db.query.workspaceMembers.findFirst({
		where: and(
			eq(workspaceMembers.workspaceId, workspaceId),
			eq(workspaceMembers.userId, userId),
		),
	});
}

export async function touchWorkspaceMemberPresence(
	workspaceSlug: string,
	userId: string,
) {
	return db
		.update(workspaceMembers)
		.set({ lastSeenAt: new Date() })
		.where(
			and(
				eq(workspaceMembers.userId, userId),
				inArray(
					workspaceMembers.workspaceId,
					db
						.select({ id: workspaces.id })
						.from(workspaces)
						.where(eq(workspaces.slug, workspaceSlug)),
				),
			),
		)
		.returning({ id: workspaceMembers.id });
}

// Deliberately narrow — this is polled, so it reads two columns off the
// workspace_id index rather than reusing the full member fetch.
export async function getWorkspacePresence(workspaceId: string) {
	return db
		.select({
			userId: workspaceMembers.userId,
			lastSeenAt: workspaceMembers.lastSeenAt,
		})
		.from(workspaceMembers)
		.where(eq(workspaceMembers.workspaceId, workspaceId));
}

export async function addWorkspaceMember(data: CreateWorkspaceMemberInput) {
	const [workspaceMember] = await db
		.insert(workspaceMembers)
		.values(data)
		.returning();

	return workspaceMember;
}

export async function updateWorkspaceMemberRole(
	workspaceId: string,
	userId: string,
	role: WorkspaceMemberRole,
	dbClient: DbClient = db,
) {
	const [workspaceMember] = await dbClient
		.update(workspaceMembers)
		.set({ role })
		.where(
			and(
				eq(workspaceMembers.workspaceId, workspaceId),
				eq(workspaceMembers.userId, userId),
			),
		)
		.returning();

	return workspaceMember;
}

export async function transferWorkspaceOwnership(
	workspaceId: string,
	currentOwnerId: string,
	newOwnerId: string,
) {
	return db.transaction(async (tx) => {
		await updateWorkspaceMemberRole(workspaceId, currentOwnerId, "admin", tx);

		return updateWorkspaceMemberRole(workspaceId, newOwnerId, "owner", tx);
	});
}

export async function removeWorkspaceMember(
	workspaceId: string,
	userId: string,
	dbClient: DbClient = db,
) {
	const [workspaceMember] = await dbClient
		.delete(workspaceMembers)
		.where(
			and(
				eq(workspaceMembers.workspaceId, workspaceId),
				eq(workspaceMembers.userId, userId),
			),
		)
		.returning();

	return workspaceMember;
}
