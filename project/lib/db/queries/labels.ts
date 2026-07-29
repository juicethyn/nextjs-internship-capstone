import { eq } from "drizzle-orm";
import type {
	CreateLabelInput,
	UpdateLabelInput,
} from "@/lib/validations/label";
import { db } from "../index";
import { labels } from "../schema";

export async function getLabelsByProject(projectId: string) {
	return db.query.labels.findMany({
		where: eq(labels.projectId, projectId),
		orderBy: (label, { asc }) => asc(label.name),
	});
}

export async function getLabelById(id: string) {
	return db.query.labels.findFirst({
		where: eq(labels.id, id),
	});
}

export async function createLabel(projectId: string, data: CreateLabelInput) {
	const [label] = await db
		.insert(labels)
		.values({
			...data,
			projectId,
		})
		.returning();

	return label;
}

export async function updateLabel(id: string, data: UpdateLabelInput) {
	const [label] = await db
		.update(labels)
		.set(data)
		.where(eq(labels.id, id))
		.returning();

	return label;
}

export async function deleteLabel(id: string) {
	const [label] = await db.delete(labels).where(eq(labels.id, id)).returning();

	return label;
}
