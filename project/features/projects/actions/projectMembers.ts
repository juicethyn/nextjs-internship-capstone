"use server";

import { revalidatePath } from "next/cache";
import { treeifyError } from "zod/v4/core";
import { createActivity } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
import {
	addProjectMembers,
	getProjectMember,
	getProjectMembers,
	removeProjectMember,
} from "@/lib/db/queries/projectMembers";
import { transferProjectLead } from "@/lib/db/queries/projects";
import { getWorkspaceMembersById } from "@/lib/db/queries/workspaceMembers";
import { FORBIDDEN_MESSAGES, requireActiveProject } from "@/lib/permission";
import {
	type AddProjectMembersInput,
	addProjectMembersSchema,
} from "@/lib/validations/projectMember";

export async function addProjectMembersAction(
	workspaceSlug: string,
	projectSlug: string,
	data: AddProjectMembersInput,
) {
	const user = await getCurrentUser();

	const validatedData = addProjectMembersSchema.safeParse(data);

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
			success: false as const,
			message: "Those members are already part of this project.",
		};
	}

	const addedMembers = await addProjectMembers(project.id, userIdsToAdd);

	await Promise.all(
		addedMembers.map((member) =>
			createActivity({
				workspaceId: project.workspaceId,
				actorId: user.id,
				projectId: project.id,
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
		success: true as const,
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

	if (project.leadId === userId) {
		return {
			success: false as const,
			message: "Transfer the project lead role before removing this member.",
		};
	}

	const member = await getProjectMember(project.id, userId);

	if (!member) {
		return {
			success: false as const,
			message: "User is not a member of this project.",
		};
	}

	const removed = await removeProjectMember(project.id, userId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
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
		success: true as const,
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

	if (project.leadId === newLeadUserId) {
		return {
			success: false as const,
			message: "That member is already the project lead.",
		};
	}

	const member = await getProjectMember(project.id, newLeadUserId);

	if (!member) {
		return {
			success: false as const,
			message: "User is not a member of this project.",
		};
	}

	const updatedProject = await transferProjectLead(project.id, newLeadUserId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		projectId: project.id,
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
		success: true as const,
		data: updatedProject,
		message: "Project lead transferred.",
	};
}
