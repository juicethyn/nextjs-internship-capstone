import { clerkSetup } from "@clerk/testing/playwright";
import { db } from "@/lib/db";
import { e2eEnv } from "./support/env";
import { resetOnboardingState } from "./support/reset-user";

export default async function globalSetup() {
	await clerkSetup();

	const email = e2eEnv.email;

	try {
		const { deletedWorkspaces } = await resetOnboardingState(email);

		console.log(
			`[e2e] reset ${email}: removed ${deletedWorkspaces} owned workspace(s), cleared occupation`,
		);
	} finally {
		await db.$client.end();
	}
}
