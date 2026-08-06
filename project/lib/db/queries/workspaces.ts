import { and, eq, exists } from "drizzle-orm";
import { generateWorkspaceSlug } from "@/lib/utils/slug";
import type {
	CreateWorkspaceInput,
	UpdateWorkspaceInput,
} from "@/lib/validations/workspace";
import type { DbClient } from "@/types/db";
import { db } from "../index";
import { workspaceMembers, workspaces } from "../schema";

// CREATE
export async function createWorkspace(
	userId: string,
	data: CreateWorkspaceInput,
	dbClient: DbClient = db,
) {
	const slug = generateWorkspaceSlug();

	const [workspace] = await dbClient.transaction(async (tx) => {
		const [workspace] = await tx
			.insert(workspaces)
			.values({
				...data,
				slug,
				createdById: userId,
			})
			.returning();

		await tx.insert(workspaceMembers).values({
			workspaceId: workspace.id,
			userId,
			role: "owner",
		});

		return [workspace];
	});

	return workspace;
}

// READ
export async function getWorkspaceByUserId(userId: string) {
	return db.query.workspaces.findFirst({
		where: exists(
			db
				.select()
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.workspaceId, workspaces.id),
					),
				),
		),
	});
}

export async function getWorkspaceById(workspaceId: string) {
	return db.query.workspaces.findFirst({
		where: eq(workspaces.id, workspaceId),
		with: {
			members: true,
			projects: true,
		},
	});
}

export async function getWorkspaceBySlug(slug: string) {
	return db.query.workspaces.findFirst({
		where: eq(workspaces.slug, slug),
		with: {
			members: true,
			projects: true,
		},
	});
}

export async function getUserWorkspaces(userId: string) {
	return db.query.workspaces.findMany({
		where: exists(
			db
				.select()
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.workspaceId, workspaces.id),
					),
				),
		),
		with: {
			members: true,
			projects: true,
		},
	});
}

export async function getUserOwnedWorkspaces(userId: string) {
	return db.query.workspaces.findMany({
		where: exists(
			db
				.select()
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.workspaceId, workspaces.id),
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.role, "owner"),
					),
				),
		),
	});
}

export function getUserWorkspaceById(workspaceId: string, userId: string) {
	return db.query.workspaceMembers.findFirst({
		where: and(
			eq(workspaceMembers.userId, userId),
			eq(workspaceMembers.workspaceId, workspaceId),
		),
		with: {
			workspace: true,
		},
	});
}

export async function updateWorkspace(
	workspaceId: string,
	data: UpdateWorkspaceInput,
) {
	const [workspace] = await db
		.update(workspaces)
		.set(data)
		.where(eq(workspaces.id, workspaceId))
		.returning();

	return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
	const [workspace] = await db
		.delete(workspaces)
		.where(eq(workspaces.id, workspaceId))
		.returning();

	return workspace;
}
