import { and, eq } from "drizzle-orm";
import type { WorkspaceMemberRole } from "@/types/workspace";
import type { CreateWorkspaceMemberInput } from "@/lib/validations/workspaceMember";
import { db } from "../index";
import { workspaceMembers } from "../schema";

export async function getWorkspaceMembers(workspaceId: string) {
	return db.query.workspaceMembers.findMany({
		where: eq(workspaceMembers.workspaceId, workspaceId),
		with: {
			user: true,
		},
	});
}

export async function getWorkspaceMember(workspaceId: string, userId: string) {
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
) {
	const [workspaceMember] = await db
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

export async function removeWorkspaceMember(
	workspaceId: string,
	userId: string,
) {
	const [workspaceMember] = await db
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
