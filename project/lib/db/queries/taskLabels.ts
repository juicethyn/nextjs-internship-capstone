import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { taskLabels } from "../schema";

export async function addLabelToTask(taskId: string, labelId: string) {
	const [taskLabel] = await db
		.insert(taskLabels)
		.values({
			taskId,
			labelId,
		})
		.returning();

	return taskLabel;
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
	const [taskLabel] = await db
		.delete(taskLabels)
		.where(and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)))
		.returning();

	return taskLabel;
}
