import { eq, inArray } from "drizzle-orm";
import type { NotificationPreferences } from "@/features/notifications/lib/preferences";
import type { DbClient } from "@/lib/db/types";
import type { UpdateUserInput } from "@/lib/validations/user";
import { db } from "../index";
import { type Occupation, users } from "../schema";

export function getUserById(id: string) {
	return db.query.users.findFirst({
		where: eq(users.id, id),
	});
}

export function getUserByClerkId(clerkId: string) {
	return db.query.users.findFirst({
		where: eq(users.clerkId, clerkId),
	});
}

export async function getUserByEmail(email: string) {
	return db.query.users.findFirst({
		where: eq(users.email, email),
	});
}

export async function getUsersByEmails(emails: string[]) {
	if (emails.length === 0) return [];

	return db.query.users.findMany({
		where: inArray(users.email, emails),
	});
}

export async function getNotificationPreferences(userIds: string[]) {
	if (userIds.length === 0) return new Map<string, NotificationPreferences>();

	const rows = await db
		.select({
			id: users.id,
			notificationsMuted: users.notificationsMuted,
			mutedNotificationCategories: users.mutedNotificationCategories,
		})
		.from(users)
		.where(inArray(users.id, userIds));

	return new Map(
		rows.map((row) => [
			row.id,
			{
				notificationsMuted: row.notificationsMuted,
				mutedNotificationCategories: row.mutedNotificationCategories,
			},
		]),
	);
}

type UpsertUserInput = {
	clerkId: string;
	email: string;
	firstName: string;
	lastName: string;
	imageUrl: string;
	occupation: Occupation;
};

export async function updateUser(
	id: string,
	data: UpdateUserInput,
	dbClient: DbClient = db,
) {
	const [user] = await dbClient
		.update(users)
		.set(data)
		.where(eq(users.id, id))
		.returning();
	return user;
}

// Update and Create user function
export async function upsertUser(
	data: UpsertUserInput,
	dbClient: DbClient = db,
) {
	const [user] = await dbClient
		.insert(users)
		.values(data)
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				imageUrl: data.imageUrl,
			},
		})
		.returning();

	return user;
}

export async function deleteUserByClerkId(clerkId: string) {
	const [user] = await db
		.delete(users)
		.where(eq(users.clerkId, clerkId))
		.returning();

	return user;
}
