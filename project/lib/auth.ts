"user server";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./db/queries/users";

export async function getCurrentUser() {
	const { userId: clerkId } = await auth.protect();

	if (!clerkId) {
		throw new Error("User not authenticated");
	}

	const user = await getUserByClerkId(clerkId);

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}
