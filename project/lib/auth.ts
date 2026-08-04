"use server";

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

export async function waitForCurrentUser() {
	const { userId: clerkId } = await auth.protect();

	if (!clerkId) {
		throw new Error("User not authenticated");
	}

	const timeout = 3000;
	const interval = 250;

	const start = Date.now();

	while (Date.now() - start < timeout) {
		const user = await getUserByClerkId(clerkId);

		if (user) {
			return user;
		}

		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	return null;
}
