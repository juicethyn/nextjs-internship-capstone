"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import {
	createList,
	deleteList,
	getListById,
	getListsByProject,
	updateList,
} from "../db/queries/lists";
import { getProjectById } from "../db/queries/projects";
import { createListSchema } from "../validations/list";

export async function createListAction(projectId: string, formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createListSchema.safeParse({
		name: formData.get("name"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const project = await getProjectById(userId, projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const list = await createList(projectId, parsed.data);

	revalidatePath("/projects");
	revalidatePath(`/projects/${projectId}`);

	return { success: true, list };
}

export async function updateListAction(listId: string, formData: FormData) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const parsed = createListSchema.safeParse({
		name: formData.get("name"),
	});

	if (!parsed.success) {
		return { success: false, error: treeifyError(parsed.error) };
	}

	const list = await getListById(listId);

	if (!list) {
		return {
			success: false,
			error: "List not found.",
		};
	}

	const project = await getProjectById(userId, list.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const updated = await updateList(listId, parsed.data);

	if (!updated) {
		return {
			success: false,
			error: "Failed to update list.",
		};
	}

	revalidatePath("/projects");
	revalidatePath(`/projects/${list.projectId}`);

	return { success: true, list: updated };
}

export async function deleteListAction(listId: string) {
	const { userId } = await auth.protect();

	if (!userId) {
		throw new Error("User not authenticated");
	}

	const list = await getListById(listId);

	if (!list) {
		return {
			success: false,
			error: "List not found.",
		};
	}

	const project = await getProjectById(userId, list.projectId);

	if (!project) {
		return {
			success: false,
			error: "Project not found or you do not have access to it.",
		};
	}

	const deleted = await deleteList(listId);

	if (!deleted) {
		return {
			success: false,
			error: "Failed to delete list.",
		};
	}

	revalidatePath("/projects");
	revalidatePath(`/projects/${list.projectId}`);

	return { success: true, list: deleted };
}

export async function getListsByProjectAction(projectId: string) {
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

	const lists = await getListsByProject(projectId);

	return { success: true, lists };
}

// export async function getListByIdAction(listId: string) {
//     // TO DO SOON
// }
