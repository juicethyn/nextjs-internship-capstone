import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { projectMembers } from "../schema";

export async function getProjectMembers(projectId: string) {
	return db.query.projectMembers.findMany({
		where: eq(projectMembers.projectId, projectId),
		with: {
			user: true,
		},
	});
}

export async function getProjectMemberByUserId(
	projectId: string,
	userId: string,
) {
	return db.query.projectMembers.findFirst({
		where: and(
			eq(projectMembers.projectId, projectId),
			eq(projectMembers.userId, userId),
		),
	});
}

export async function addProjectMember(projectId: string, userId: string) {
	const [projectMember] = await db
		.insert(projectMembers)
		.values({
			projectId,
			userId,
		})
		.returning();

	return projectMember;
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
