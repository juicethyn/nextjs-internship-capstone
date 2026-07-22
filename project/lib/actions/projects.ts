"use server";

import { auth } from "@clerk/nextjs/server";
import { treeifyError } from "zod/v4/core";
import { createProject } from "../db/queries/projects";
import { createProjectSchema } from "../validations/project";

export async function getProjectsByOwner(formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createProjectSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate")
			? new Date(formData.get("dueDate") as string)
			: undefined,
	});

	if (!parsed.success) {
		return { error: treeifyError(parsed.error) };
	}

	const project = await createProject(userId, parsed.data);

	return { success: true, project };
}
