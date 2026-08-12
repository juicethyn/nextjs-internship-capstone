"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	addProjectMembers,
	getProjectMember,
	getProjectMembers,
	removeProjectMember,
} from "../db/queries/projectMembers";
import { transferProjectLead } from "../db/queries/projects";
import { getWorkspaceMembersById } from "../db/queries/workspaceMembers";
import { isProjectManager, requireActiveProject } from "../permission";
import {
	type AddProjectMembersInput,
	addProjectMembersSchema,
} from "../validations/projectMember";

const FORBIDDEN_MESSAGE =
	"Only the project lead or a workspace owner/admin can manage project members.";

export async function addProjectMembersAction(
	workspaceSlug: string,
	projectSlug: string,
	data: AddProjectMembersInput,
) {
	const user = await getCurrentUser();

	const validatedData = addProjectMembersSchema.safeParse(data);

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

	const [workspaceMembers, existingMembers] = await Promise.all([
		getWorkspaceMembersById(project.workspaceId),
		getProjectMembers(project.id),
	]);

	const workspaceUserIds = new Set(
		workspaceMembers.map((member) => member.userId),
	);
	const existingUserIds = new Set(
		existingMembers.map((member) => member.userId),
	);

	// Prevents a race condition where two users add the same member at the same time, and one of them gets a error.
	const userIdsToAdd = [...new Set(validatedData.data.userIds)].filter(
		(userId) => workspaceUserIds.has(userId) && !existingUserIds.has(userId),
	);

	if (userIdsToAdd.length === 0) {
		return {
			success: false,
			message: "Those members are already part of this project.",
		};
	}

	const addedMembers = await addProjectMembers(project.id, userIdsToAdd);

	await Promise.all(
		addedMembers.map((member) =>
			createActivity({
				workspaceId: project.workspaceId,
				actorId: user.id,
				action: "created",
				entity: "project_member",
				entityId: member.id,
				metadata: {
					project: project.name,
					userId: member.userId,
				},
			}),
		),
	);

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: addedMembers,
		message:
			addedMembers.length === 1
				? "Member added to the project."
				: `${addedMembers.length} members added to the project.`,
	};
}

export async function removeProjectMemberAction(
	workspaceSlug: string,
	projectSlug: string,
	userId: string,
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

	if (project.leadId === userId) {
		return {
			success: false,
			message: "Transfer the project lead role before removing this member.",
		};
	}

	const member = await getProjectMember(project.id, userId);

	if (!member) {
		return {
			success: false,
			message: "User is not a member of this project.",
		};
	}

	const removed = await removeProjectMember(project.id, userId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "deleted",
		entity: "project_member",
		entityId: member.id,
		metadata: {
			project: project.name,
			userId: member.userId,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: removed,
		message: "Member removed from the project.",
	};
}

export async function transferProjectLeadAction(
	workspaceSlug: string,
	projectSlug: string,
	newLeadUserId: string,
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

	if (project.leadId === newLeadUserId) {
		return {
			success: false,
			message: "That member is already the project lead.",
		};
	}

	const member = await getProjectMember(project.id, newLeadUserId);

	if (!member) {
		return {
			success: false,
			message: "User is not a member of this project.",
		};
	}

	const updatedProject = await transferProjectLead(project.id, newLeadUserId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "transferred",
		entity: "project",
		entityId: project.id,
		metadata: {
			previousLeadId: project.leadId,
			newLeadId: newLeadUserId,
		},
	});

	revalidatePath(`/w/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: updatedProject,
		message: "Project lead transferred.",
	};
}
