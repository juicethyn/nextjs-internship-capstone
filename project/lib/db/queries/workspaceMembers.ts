import { and, eq, inArray } from "drizzle-orm";
import type { CreateWorkspaceMemberInput } from "@/lib/validations/workspaceMember";
import type { DbClient } from "@/types/db";
import type { WorkspaceMemberRole } from "@/types/workspace";
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

// Authorization and write in one statement: the slug subquery means a caller
// who is not a member of that workspace updates zero rows, so no separate
// permission round trip is needed on a query that runs once a minute per user.
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
