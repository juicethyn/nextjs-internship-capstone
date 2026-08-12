"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	createList,
	deleteList,
	rebalanceListPositionsIfNeeded,
	updateList,
	updateListPosition,
} from "../db/queries/lists";
import { syncProjectCompletionStatus } from "../db/queries/projects";
import {
	FORBIDDEN_MESSAGES,
	requireActiveProject,
	requireList,
} from "../permission";
import {
	type CreateListInput,
	createListSchema,
	type UpdateListInput,
	updateListSchema,
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
			success: false as const,
			message: treeifyError(validatedDate.error),
		};
	}

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
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

	return { success: true as const, data: list };
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
			success: false as const,
			message: treeifyError(validatedData.error),
		};
	}

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	const listResult = await requireList(listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Invalid list.",
		};
	}

	const updatedList = await updateList(listId, validatedData.data);

	if (!updatedList) {
		return {
			success: false as const,
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
		success: true as const,
		data: updatedList,
	};
}

export async function deleteListAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
) {
	const user = await getCurrentUser();

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	const listResult = await requireList(listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Invalid list.",
		};
	}

	if (list.type === "done") {
		return {
			success: false as const,
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
		success: true as const,
		data: deletedList,
	};
}

export async function moveListAction(
	workspaceSlug: string,
	projectSlug: string,
	listId: string,
	position: number,
) {
	const user = await getCurrentUser();

	if (!Number.isFinite(position)) {
		return {
			success: false as const,
			message: "Invalid list position.",
		};
	}

	const access = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	if (!canManage) {
		return {
			success: false as const,
			message: FORBIDDEN_MESSAGES.projectManager,
		};
	}

	const listResult = await requireList(listId);

	if (!listResult.success) {
		return { success: false as const, message: listResult.message };
	}

	const list = listResult.data;

	if (list.projectId !== project.id) {
		return {
			success: false as const,
			message: "Invalid list.",
		};
	}

	const movedList = await updateListPosition(listId, position);

	// Self-heals if repeated midpoint splits ever collapse a gap.
	await rebalanceListPositionsIfNeeded(project.id);

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true as const,
		data: movedList,
	};
}

// export async function getListByIdAction(listId: string) {
//     // TO DO SOON
// }
