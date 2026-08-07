"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	createWorkspaceLabel,
	deleteWorkspaceLabel,
	getLabelsByWorkspace,
	getWorkspaceLabelById,
	updateWorkspaceLabel,
} from "../db/queries/workspaceLabels";
import { requireWorkspaceAdmin, requireWorkspaceMember } from "../permission";
import {
	type CreateWorkspaceLabelInput,
	createWorkspaceLabelSchema,
	updateWorkspaceLabelSchema,
} from "../validations/label";

// CREATE
export async function createWorkspaceLabelAction(
	workspaceSlug: string,
	data: CreateWorkspaceLabelInput,
) {
	const user = await getCurrentUser();

	const validatedData = createWorkspaceLabelSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid label data.",
		};
	}

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	// The table has unique(workspaceId, name); check first so a duplicate reads as
	// a form error instead of an uncaught unique violation.
	const existingLabels = await getLabelsByWorkspace(workspace.id);

	const isDuplicate = existingLabels.some(
		(label) =>
			label.name.toLowerCase() === validatedData.data.name.toLowerCase(),
	);

	if (isDuplicate) {
		return {
			success: false,
			error: "A label with that name already exists.",
		};
	}

	const label = await createWorkspaceLabel(workspace.id, validatedData.data);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "created",
		entity: "label",
		entityId: label.id,
		metadata: {
			name: label.name,
		},
	});

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true,
		data: label,
	};
}

// READ
export async function getWorkspaceLabels(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	const labels = await getLabelsByWorkspace(workspace.id);

	return {
		success: true,
		data: labels,
	};
}

export async function updateWorkspaceLabelAction(
	workspaceSlug: string,
	labelId: string,
	data: CreateWorkspaceLabelInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateWorkspaceLabelSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			error: "Invalid label data.",
		};
	}

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const label = await getWorkspaceLabelById(labelId);

	if (!label || label.workspaceId !== workspace.id) {
		return {
			success: false,
			error: "Label not found.",
		};
	}

	const updatedLabel = await updateWorkspaceLabel(labelId, validatedData.data);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "label",
		entityId: label.id,
		metadata: {
			name: updatedLabel.name,
		},
	});

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true,
		data: updatedLabel,
	};
}

export async function deleteWorkspaceLabelAction(
	workspaceSlug: string,
	labelId: string,
) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceAdmin(workspaceSlug, user.id);

	const label = await getWorkspaceLabelById(labelId);

	if (!label || label.workspaceId !== workspace.id) {
		return {
			success: false,
			error: "Label not found.",
		};
	}

	const deletedLabel = await deleteWorkspaceLabel(labelId);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "deleted",
		entity: "label",
		entityId: label.id,
		metadata: {
			name: label.name,
		},
	});

	revalidatePath(`/w/${workspace.slug}`, "layout");

	return {
		success: true,
		data: deletedLabel,
	};
}
