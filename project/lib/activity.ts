import { db } from "./db";
import { activityLogs } from "./db/schema";
import type { CreateActivityInput } from "./validations/activityLog";

export async function createActivity(data: CreateActivityInput) {
	const [activity] = await db.insert(activityLogs).values(data).returning();
	return activity;
}
