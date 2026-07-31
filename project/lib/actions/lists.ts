"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	createList,
	deleteList,
	getListById,
	getListsByProject,
	updateList,
} from "../db/queries/lists";
import { getProjectById } from "../db/queries/projects";
import { requireActiveProject, requireList } from "../permission";
import {
	type CreateListInput,
	createListSchema,
	type UpdateListInput,
} from "../validations/list";

export async function createListAction(
	workspaceSlug: string,
	projectSlug: string,
	data: CreateListInput,
) {
	const user = await getCurrentUser();

	const validatedDate = createListSchema.safeParse(data);

	if (!validatedDate.success) {
		return {
			success: false,
			message: treeifyError(validatedDate.error),
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const list = await createList(project.id, validatedDate.data);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "created",
		entity: "list",
		entityId: list.id,
		metadata: {
			name: list.name,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return { success: true, data: list };
}

export async function updateListAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
	data: UpdateListInput,
) {
	const user = await getCurrentUser();

	const validatedData = createListSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: treeifyError(validatedData.error),
		};
	}

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
			error: "Invalid list.",
		};
	}

	const updatedList = await updateList(listId, validatedData.data);

	if (!updatedList) {
		return {
			success: false,
			error: "Failed to update list.",
		};
	}

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "updated",
		entity: "list",
		entityId: list.id,
		metadata: {
			name: updatedList.name,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: updatedList,
	};
}

export async function deleteListAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
			error: "Invalid list.",
		};
	}

	const deletedList = await deleteList(listId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "deleted",
		entity: "list",
		entityId: list.id,
		metadata: {
			name: list.name,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: deletedList,
	};
}

export async function getListsByProjectAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const lists = await getListsByProject(project.id);

	return {
		success: true,
		data: lists,
	};
}

// export async function getListByIdAction(listId: string) {
//     // TO DO SOON
// }
