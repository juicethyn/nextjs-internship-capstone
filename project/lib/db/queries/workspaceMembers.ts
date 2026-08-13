import { and, eq } from "drizzle-orm";
import type { CreateWorkspaceMemberInput } from "@/lib/validations/workspaceMember";
import type { DbClient } from "@/types/db";
import type { WorkspaceMemberRole } from "@/types/workspace";
import { db } from "../index";
import { workspaceMembers } from "../schema";

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
