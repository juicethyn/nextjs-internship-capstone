"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import {
	createWorkspaceLabel,
	deleteWorkspaceLabel,
	getLabelsByWorkspace,
	getWorkspaceLabelById,
} from "@/lib/db/queries/workspaceLabels";
import {
	requireWorkspaceAdmin,
	requireWorkspaceMember,
} from "@/lib/permission";
import {
	type CreateWorkspaceLabelInput,
	createWorkspaceLabelSchema,
} from "@/lib/validations/label";

// CREATE
export async function createWorkspaceLabelAction(
	workspaceSlug: string,
	data: CreateWorkspaceLabelInput,
) {
	const user = await getCurrentUser();

	const validatedData = createWorkspaceLabelSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid label data.",
		};
	}

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	// The table has unique(workspaceId, name); check first so a duplicate reads as
	// a form error instead of an uncaught unique violation.
	const existingLabels = await getLabelsByWorkspace(workspace.id);

	const isDuplicate = existingLabels.some(
		(label) =>
			label.name.toLowerCase() === validatedData.data.name.toLowerCase(),
	);

	if (isDuplicate) {
		return {
			success: false as const,
			message: "A label with that name already exists.",
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
		success: true as const,
		data: label,
	};
}

// READ
export async function getWorkspaceLabels(workspaceSlug: string) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceMember(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const labels = await getLabelsByWorkspace(workspace.id);

	return {
		success: true as const,
		data: labels,
	};
}

export async function deleteWorkspaceLabelAction(
	workspaceSlug: string,
	labelId: string,
) {
	const user = await getCurrentUser();

	const access = await requireWorkspaceAdmin(workspaceSlug, user.id);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const workspace = access.data;

	const label = await getWorkspaceLabelById(labelId);

	if (!label || label.workspaceId !== workspace.id) {
		return {
			success: false as const,
			message: "Label not found.",
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
		success: true as const,
		data: deletedLabel,
	};
}
