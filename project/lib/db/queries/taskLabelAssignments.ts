import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { taskLabelAssignments } from "../schema";

export async function getLabelsByTask(taskId: string) {
	return db.query.taskLabelAssignments.findMany({
		where: eq(taskLabelAssignments.taskId, taskId),
		with: {
			taskLabel: true,
		},
	});
}

export async function addLabelToTask(taskId: string, taskLabelId: string) {
	const [assignment] = await db
		.insert(taskLabelAssignments)
		.values({
			taskId,
			taskLabelId,
		})
		.returning();

	return assignment;
}

export async function removeLabelFromTask(taskId: string, taskLabelId: string) {
	const [assignment] = await db
		.delete(taskLabelAssignments)
		.where(
			and(
				eq(taskLabelAssignments.taskId, taskId),
				eq(taskLabelAssignments.taskLabelId, taskLabelId),
			),
		)
		.returning();

	return assignment;
}
