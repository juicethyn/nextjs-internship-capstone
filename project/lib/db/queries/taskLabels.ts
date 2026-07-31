import { eq } from "drizzle-orm";
import type {
	CreateTaskLabelInput,
	UpdateTaskLabelInput,
} from "@/lib/validations/label";
import { db } from "../index";
import { taskLabels } from "../schema";

export async function getTaskLabelsByProject(projectId: string) {
	return db.query.taskLabels.findMany({
		where: eq(taskLabels.projectId, projectId),
		orderBy: (label, { asc }) => asc(label.name),
	});
}

export async function getTaskLabelById(labelId: string) {
	return db.query.taskLabels.findFirst({
		where: eq(taskLabels.id, labelId),
	});
}

export async function createTaskLabel(
	projectId: string,
	data: CreateTaskLabelInput,
) {
	const [label] = await db
		.insert(taskLabels)
		.values({
			...data,
			projectId,
		})
		.returning();

	return label;
}

export async function updateTaskLabel(
	labelId: string,
	data: UpdateTaskLabelInput,
) {
	const [label] = await db
		.update(taskLabels)
		.set(data)
		.where(eq(taskLabels.id, labelId))
		.returning();

	return label;
}

export async function deleteTaskLabel(labelId: string) {
	const [label] = await db
		.delete(taskLabels)
		.where(eq(taskLabels.id, labelId))
		.returning();

	return label;
}
