import { eq } from "drizzle-orm";
import type { CreateActivityInput } from "@/lib/validations/activityLog";
import { db } from "../index";
import { activityLogs } from "../schema";

export async function createActivity(data: CreateActivityInput) {
	const [activityLog] = await db.insert(activityLogs).values(data).returning();

	return activityLog;
}

export async function getWorkspaceActivity(workspaceId: string) {
	return db.query.activityLogs.findMany({
		where: eq(activityLogs.workspaceId, workspaceId),
		orderBy: (activityLog, { desc }) => desc(activityLog.createdAt),
		with: {
			actor: true,
		},
	});
}
