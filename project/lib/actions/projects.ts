"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import {
	createProject,
	deleteProject,
	getProjectById,
	getProjectsByOwner,
	updateProject,
} from "../db/queries/projects";
import { createProjectSchema } from "../validations/project";

export async function createProjectAction(formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createProjectSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const project = await createProject(userId, parsed.data);

	revalidatePath("/projects");

	return { success: true, project };
}

export async function updateProjectAction(
	projectId: string,
	formData: FormData,
) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createProjectSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const project = await updateProject(userId, projectId, parsed.data);

	revalidatePath("/projects");
	revalidatePath(`/projects/${projectId}`);

	return { success: true, project };
}

export async function deleteProjectAction(projectId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const project = await deleteProject(userId, projectId);

	revalidatePath("/projects");

	return { success: true, project };
}

export async function getProjectsByOwnerAction() {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	return await getProjectsByOwner(userId);
}

export async function getProjectByIdAction(projectId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const project = await getProjectById(userId, projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	return { success: true, project };
}
