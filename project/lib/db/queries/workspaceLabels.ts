import { eq } from "drizzle-orm";
import type {
	CreateWorkspaceLabelInput,
	UpdateWorkspaceLabelInput,
} from "@/lib/validations/label";
import { db } from "../index";
import { workspaceLabels } from "../schema";

export async function getLabelsByWorkspace(workspaceId: string) {
	return db.query.workspaceLabels.findMany({
		where: eq(workspaceLabels.workspaceId, workspaceId),
		orderBy: (label, { asc }) => asc(label.name),
	});
}

export async function getWorkspaceLabelById(labelId: string) {
	return db.query.workspaceLabels.findFirst({
		where: eq(workspaceLabels.id, labelId),
	});
}

export async function createWorkspaceLabel(
	workspaceId: string,
	data: CreateWorkspaceLabelInput,
) {
	const [label] = await db
		.insert(workspaceLabels)
		.values({
			...data,
			workspaceId,
		})
		.returning();

	return label;
}

export async function updateWorkspaceLabel(
	labelId: string,
	data: UpdateWorkspaceLabelInput,
) {
	const [label] = await db
		.update(workspaceLabels)
		.set(data)
		.where(eq(workspaceLabels.id, labelId))
		.returning();

	return label;
}

export async function deleteWorkspaceLabel(labelId: string) {
	const [label] = await db
		.delete(workspaceLabels)
		.where(eq(workspaceLabels.id, labelId))
		.returning();

	return label;
}
