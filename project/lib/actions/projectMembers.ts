import { revalidatePath } from "next/cache";
import { createActivity } from "../activity";
import { getCurrentUser } from "../auth";
import {
	addProjectMember,
	getProjectMember,
	getProjectMembers,
	removeProjectMember,
	updateProjectLead,
} from "../db/queries/projectMembers";
import { getWorkspaceMember } from "../db/queries/workspaceMembers";
import { requireActiveProject, requireProjectLead } from "../permission";

export async function getProjectMembersAction(
	workspaceSlug: string,
	projectSlug: string,
) {
	const user = await getCurrentUser();

	const project = await requireActiveProject(
		workspaceSlug,
		projectSlug,
		user.id,
	);

	const members = await getProjectMembers(project.id);

	return members;
}

export async function addProjectMemberAction(
	workspaceSlug: string,
	projectSlug: string,
	memberUserId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	const workspaceMember = await getWorkspaceMember(
		project.workspaceId,
		memberUserId,
	);

	if (!workspaceMember) {
		return {
			success: false,
			error: "User is not a member of the workspace.",
		};
	}

	const existingMember = await getProjectMember(project.id, memberUserId);

	if (existingMember) {
		return {
			success: false,
			error: "User is already a member of this project.",
		};
	}

	const member = await addProjectMember(project.id, memberUserId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "created",
		entity: "project_member",
		entityId: member.id,
		metadata: {
			project: project.name,
			userId: memberUserId,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: member,
	};
}

export async function removeProjectMemberAction(
	workspaceSlug: string,
	projectSlug: string,
	memberId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	const member = await getProjectMember(project.id, memberId);

	if (!member || member.projectId !== project.id) {
		return {
			success: false,
			error: "User is not a member of this project.",
		};
	}

	const removed = await removeProjectMember(project.id, memberId);

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

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: removed,
	};
}

export async function transferProjectLeadAction(
	workspaceSlug: string,
	projectSlug: string,
	newLeadUserId: string,
) {
	const user = await getCurrentUser();

	const project = await requireProjectLead(workspaceSlug, projectSlug, user.id);

	const member = getProjectMember(project.id, newLeadUserId);

	if (!member) {
		return {
			success: false,
			error: "User is not a member of this project.",
		};
	}

	const updatedProject = await updateProjectLead(project.id, newLeadUserId);

	await createActivity({
		workspaceId: project.workspaceId,
		actorId: user.id,
		action: "updated",
		entity: "project",
		entityId: project.id,
		metadata: {
			previousLead: user.id,
			newLead: newLeadUserId,
		},
	});

	revalidatePath(`/workspaces/${workspaceSlug}/projects/${project.slug}`);

	return {
		success: true,
		data: updatedProject,
	};
}
