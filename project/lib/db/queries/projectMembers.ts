import { and, eq, inArray } from "drizzle-orm";
import type { DbClient } from "@/lib/db/types";
import { db } from "../index";
import { projectMembers, projects } from "../schema";

export async function getProjectMembers(projectId: string) {
	return db.query.projectMembers.findMany({
		where: eq(projectMembers.projectId, projectId),
		with: {
			user: true,
		},
	});
}

export async function getProjectMember(projectId: string, userId: string) {
	return db.query.projectMembers.findFirst({
		where: and(
			eq(projectMembers.projectId, projectId),
			eq(projectMembers.userId, userId),
		),
	});
}

export async function addProjectMember(
	projectId: string,
	userId: string,
	dbClient: DbClient = db,
) {
	const [projectMember] = await dbClient
		.insert(projectMembers)
		.values({
			projectId,
			userId,
		})
		.returning();

	return projectMember;
}

export async function addProjectMembers(
	projectId: string,
	userIds: string[],
	dbClient: DbClient = db,
) {
	return dbClient
		.insert(projectMembers)
		.values(userIds.map((userId) => ({ projectId, userId })))
		.returning();
}

// Kicking someone from a workspace has to take their project memberships with
// it — project_members references users, not workspace_members, so the rows
// would otherwise survive and keep granting project access.
export async function removeUserFromWorkspaceProjects(
	workspaceId: string,
	userId: string,
	dbClient: DbClient = db,
) {
	return dbClient
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.userId, userId),
				inArray(
					projectMembers.projectId,
					dbClient
						.select({ id: projects.id })
						.from(projects)
						.where(eq(projects.workspaceId, workspaceId)),
				),
			),
		)
		.returning();
}

export async function removeProjectMember(projectId: string, userId: string) {
	const [projectMember] = await db
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		)
		.returning();

	return projectMember;
}
