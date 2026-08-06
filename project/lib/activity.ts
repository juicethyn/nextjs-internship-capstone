import type { DbClient } from "@/types/db";
import { db } from "./db";
import { activityLogs } from "./db/schema";
import type { CreateActivityInput } from "./validations/activityLog";

export async function createActivity(
	data: CreateActivityInput,
	dbClient: DbClient = db,
) {
	const [activity] = await dbClient
		.insert(activityLogs)
		.values(data)
		.returning();
	return activity;
}
