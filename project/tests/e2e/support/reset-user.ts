import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUserOwnedWorkspaces } from "@/lib/db/queries/workspaces";
import { users, workspaces } from "@/lib/db/schema";

export async function resetOnboardingState(email: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.email, email),
	});

	if (!user) {
		throw new Error(
			[
				`No users row found for ${email}.`,
				"The app row is created by the Clerk webhook on user.created, so sign in",
				"manually as this account once (with the webhook reachable) before running the suite.",
			].join(" "),
		);
	}

	const owned = await getUserOwnedWorkspaces(user.id);

	if (owned.length > 0) {
		await db.delete(workspaces).where(
			inArray(
				workspaces.id,
				owned.map((workspace) => workspace.id),
			),
		);
	}

	await db
		.update(users)
		.set({ occupation: null, lastWorkspaceId: null })
		.where(eq(users.id, user.id));

	return { userId: user.id, deletedWorkspaces: owned.length };
}
