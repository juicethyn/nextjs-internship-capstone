import { and, eq, exists } from "drizzle-orm";
import { generateWorkspaceSlug } from "@/lib/slug";
import type {
	CreateWorkspaceInput,
	UpdateWorkspaceInput,
} from "@/lib/validations/workspace";
import { db } from "../index";
import { workspaceMembers, workspaces } from "../schema";

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

export async function createWorkspace(
	userId: string,
	data: CreateWorkspaceInput,
) {
	const slug = generateWorkspaceSlug();

	const [workspace] = await db
		.insert(workspaces)
		.values({
			...data,
			slug,
			createdById: userId,
		})
		.returning();

	await db.insert(workspaceMembers).values({
		workspaceId: workspace.id,
		userId,
		role: "owner",
	});

	return workspace;
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
