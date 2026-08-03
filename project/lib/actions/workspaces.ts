"use server";

import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import { updateUser } from "../db/queries/users";
import { addWorkspaceMember } from "../db/queries/workspaceMembers";
import {
	createWorkspace,
	deleteWorkspace,
	getUserWorkspaceById,
	getUserWorkspaces,
	updateWorkspace,
} from "../db/queries/workspaces";
import { requireWorkspaceMember, requireWorkspaceOwner } from "../permission";
import {
	type CreateWorkspaceInput,
	createWorkspaceSchema,
	type UpdateWorkspaceInput,
	updateWorkspaceSchema,
} from "../validations/workspace";

export async function createWorkspaceAction(data: CreateWorkspaceInput) {
	const user = await getCurrentUser();

	const validatedData = createWorkspaceSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: "Invalid data",
		};
	}

	const workspace = await createWorkspace(user.id, validatedData.data);

	await addWorkspaceMember({
		workspaceId: workspace.id,
		userId: user.id,
		role: "owner",
	});

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
	});

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "created",
		entity: "workspace",
		entityId: workspace.id,
		metadata: {
			name: workspace.name,
		},
	});

	revalidatePath("/");
	revalidatePath(`/workspaces`);

	return {
		success: true,
		data: workspace,
	};
}

export async function updateWorkspaceAction(
	workspaceSlug: string,
	data: UpdateWorkspaceInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateWorkspaceSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false,
			message: "Invalid data",
		};
	}

	const workspace = await requireWorkspaceOwner(workspaceSlug, user.id);

	const updatedWorkspace = await updateWorkspace(
		workspace.id,
		validatedData.data,
	);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "updated",
		entity: "workspace",
		entityId: workspace.id,
		metadata: {
			name: updatedWorkspace.name,
		},
	});

	revalidatePath(`/workspaces/${updatedWorkspace.slug}`);

	return {
		success: true,
		data: updatedWorkspace,
	};
}

export async function deleteWorkspaceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceOwner(workspaceSlug, user.id);

	await createActivity({
		workspaceId: workspace.id,
		actorId: user.id,
		action: "deleted",
		entity: "workspace",
		entityId: workspace.id,
		metadata: {
			name: workspace.name,
		},
	});

	await deleteWorkspace(workspace.id);

	const workspaces = await getUserWorkspaces(user.id);

	if (workspaces.length > 0) {
		await updateUser(user.id, {
			lastWorkspaceId: workspaces[0].id,
		});
	} else {
		await updateUser(user.id, {
			lastWorkspaceId: null,
		});
	}

	revalidatePath(`/workspaces`);

	return {
		success: true,
		message: "Workspace deleted successfully",
	};
}

export async function switchWorkspaceAction(workspaceSlug: string) {
	const user = await getCurrentUser();

	const workspace = await requireWorkspaceMember(workspaceSlug, user.id);

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
	});

	revalidatePath(`/workspaces/${workspace.id}`);

	return {
		success: true,
		message: "Workspace switched successfully",
	};
}

export async function getCurrentWorkspaceAction() {
	const user = await getCurrentUser();

	if (user.lastWorkspaceId) {
		const membership = await getUserWorkspaceById(
			user.lastWorkspaceId,
			user.id,
		);

		if (membership?.workspace) {
			return {
				success: true,
				data: membership.workspace,
			};
		}
	}

	const workspaces = await getUserWorkspaces(user.id);

	if (workspaces.length === 0) {
		return {
			success: true,
			data: null,
		};
	}

	const workspace = workspaces[0];

	await updateUser(user.id, {
		lastWorkspaceId: workspace.id,
	});

	return {
		success: true,
		data: workspace,
	};
}
