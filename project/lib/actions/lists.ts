"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	createList,
	deleteList,
	getListsByProject,
	updateList,
} from "../db/queries/lists";
import { syncProjectCompletionStatus } from "../db/queries/projects";
import {
	isProjectManager,
	requireActiveProject,
	requireList,
} from "../permission";
import {
	type CreateListInput,
	createListSchema,
	type UpdateListInput,
	updateListSchema,
} from "../validations/list";

const FORBIDDEN_MESSAGE =
	"Only the project lead or a workspace owner/admin can manage lists.";

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

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

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

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return { success: true, data: list };
}

export async function updateListAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
	data: UpdateListInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateListSchema.safeParse(data);

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

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
			message: "Invalid list.",
		};
	}

	const updatedList = await updateList(listId, validatedData.data);

	if (!updatedList) {
		return {
			success: false,
			message: "Failed to update list.",
		};
	}

	// A list's type can flip to or from "done", which moves the done ratio.
	await syncProjectCompletionStatus(project.id);

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

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

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

	const canManage = await isProjectManager(
		project.workspaceId,
		project.leadId,
		user.id,
	);

	if (!canManage) {
		return {
			success: false,
			message: FORBIDDEN_MESSAGE,
		};
	}

	const list = await requireList(listId);

	if (list.projectId !== project.id) {
		return {
			success: false,
			message: "Invalid list.",
		};
	}

	if (list.type === "done") {
		return {
			success: false,
			message: "The Done list cannot be deleted.",
		};
	}

	const deletedList = await deleteList(listId);

	// The list's tasks cascade away with it, which can change the done ratio.
	await syncProjectCompletionStatus(project.id);

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

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: deletedList,
	};
}

export async function getListsByProjectBySlug(
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
