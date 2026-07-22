import { eq } from "drizzle-orm";
import type { UpdateUserInput } from "@/lib/validations/user";
import { db } from "../index";
import { type JobTitle, users } from "../schema";

export function getUserById(id: string) {
	return db.query.users.findFirst({
		where: eq(users.id, id),
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
	jobTitle: JobTitle;
};

export async function upsertUser(data: UpsertUserInput) {
	const [user] = await db
		.insert(users)
		.values(data)
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				clerkId: data.clerkId,
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				imageUrl: data.imageUrl,
				jobTitle: data.jobTitle,
			},
		})
		.returning();

	return user;
}
