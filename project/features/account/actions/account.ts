"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getUserByEmail, updateUser } from "@/lib/db/queries/users";
import {
	type ProfileSettingsInput,
	profileSettingsSchema,
} from "@/lib/validations/user";

export async function updateProfileAction(data: ProfileSettingsInput) {
	const user = await getCurrentUser();

	const validated = profileSettingsSchema.safeParse(data);

	if (!validated.success) {
		return { success: false as const, message: "Invalid profile details." };
	}

	const { firstName, lastName, occupation } = validated.data;

	try {
		const clerk = await clerkClient();

		await clerk.users.updateUser(user.clerkId, { firstName, lastName });
	} catch {
		return { success: false as const, message: "Couldn't update your name." };
	}

	await updateUser(user.id, { firstName, lastName, occupation });

	revalidatePath("/account");

	return { success: true as const };
}

export async function syncAvatarAction(imageUrl: string) {
	const user = await getCurrentUser();

	if (!URL.canParse(imageUrl)) {
		return { success: false as const, message: "Invalid image URL." };
	}

	await updateUser(user.id, { imageUrl });

	revalidatePath("/account");

	return { success: true as const };
}

export async function syncEmailAction() {
	const user = await getCurrentUser();
	const clerkUser = await currentUser();

	const email = clerkUser?.primaryEmailAddress?.emailAddress;

	if (!email) {
		return {
			success: false as const,
			message: "Couldn't read your new email.",
		};
	}

	if (email === user.email) {
		return { success: true as const };
	}

	const existing = await getUserByEmail(email);

	if (existing && existing.id !== user.id) {
		return {
			success: false as const,
			message: "That email is already in use.",
		};
	}

	await updateUser(user.id, { email });

	revalidatePath("/account");
	revalidatePath("/account/security");

	return { success: true as const };
}
