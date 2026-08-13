import { eq, inArray } from "drizzle-orm";
import type { UpdateUserInput } from "@/lib/validations/user";
import type { DbClient } from "@/types/db";
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
				occupation: data.occupation,
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
