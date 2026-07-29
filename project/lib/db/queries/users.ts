import { eq } from "drizzle-orm";
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

export async function updateUser(id: string, data: UpdateUserInput) {
	const [user] = await db
		.update(users)
		.set(data)
		.where(eq(users.id, id))
		.returning();
	return user;
}

type UpsertUserInput = {
	clerkId: string;
	email: string;
	firstName: string;
	lastName: string;
	imageUrl: string;
	occupation: Occupation;
};

export async function upsertUser(data: UpsertUserInput) {
	const [user] = await db
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
