import { and, eq, exists } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
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

export async function createWorkspace(
	userId: string,
	data: CreateWorkspaceInput,
) {
	const slug = generateSlug(data.name);

	return db.transaction(async (tx) => {
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

		return workspace;
	});
}

export async function updateWorkspace(
	workspaceId: string,
	data: UpdateWorkspaceInput,
) {
	const slug = data.name ? generateSlug(data.name) : undefined;

	const [workspace] = await db
		.update(workspaces)
		.set({
			...data,
			...(slug && { slug }),
		})
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
