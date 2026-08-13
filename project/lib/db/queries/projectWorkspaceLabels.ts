import { and, eq } from "drizzle-orm";
import type { DbClient } from "@/lib/db/types";
import { db } from "../index";
import { projectWorkspaceLabels } from "../schema";

export function getLabelsByProject(projectId: string) {
	return db.query.projectWorkspaceLabels.findMany({
		where: eq(projectWorkspaceLabels.projectId, projectId),
		with: {
			workspaceLabel: true,
		},
	});
}

export async function setProjectLabels(
	projectId: string,
	workspaceLabelIds: string[],
	dbClient: DbClient = db,
) {
	if (workspaceLabelIds.length === 0) {
		return [];
	}

	return (
		dbClient
			.insert(projectWorkspaceLabels)
			.values(
				workspaceLabelIds.map((workspaceLabelId) => ({
					projectId,
					workspaceLabelId,
				})),
			)
			// The table has unique(projectId, workspaceLabelId); a duplicate in the
			// payload should be a no-op, not a unique violation.
			.onConflictDoNothing()
			.returning()
	);
}

export async function removeLabelFromProject(
	projectId: string,
	workspaceLabelId: string,
	dbClient: DbClient = db,
) {
	const [removed] = await dbClient
		.delete(projectWorkspaceLabels)
		.where(
			and(
				eq(projectWorkspaceLabels.projectId, projectId),
				eq(projectWorkspaceLabels.workspaceLabelId, workspaceLabelId),
			),
		)
		.returning();

	return removed;
}
