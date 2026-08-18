"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
	createEvent,
	deleteEvent,
	updateEvent,
} from "@/lib/db/queries/calendar";
import { requireActiveProject, requireEvent } from "@/lib/permission";
import {
	type CreateEventInput,
	createEventSchema,
	type UpdateEventInput,
	updateEventSchema,
} from "@/lib/validations/event";

const NOT_YOURS = "You can only change your own events.";

async function requireManageableEvent(
	workspaceSlug: string,
	projectSlug: string,
	eventId: string,
	userId: string,
) {
	const access = await requireActiveProject(workspaceSlug, projectSlug, userId);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const { project, canManage } = access.data;

	const eventResult = await requireEvent(eventId);

	if (!eventResult.success) {
		return { success: false as const, message: eventResult.message };
	}

	const event = eventResult.data;

	if (event.projectId !== project.id) {
		return {
			success: false as const,
			message: "Event does not belong to the project.",
		};
	}

	if (event.createdById !== userId && !canManage) {
		return { success: false as const, message: NOT_YOURS };
	}

	return { success: true as const, data: { project, event } };
}

export async function createEventAction(
	workspaceSlug: string,
	projectSlug: string,
	data: CreateEventInput,
) {
	const user = await getCurrentUser();

	const validatedData = createEventSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid event data.",
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

	const { project } = access.data;

	const event = await createEvent({
		projectId: project.id,
		createdById: user.id,
		title: validatedData.data.title,
		description: validatedData.data.description ?? null,
		startAt: validatedData.data.startAt,
		endAt: validatedData.data.endAt,
		allDay: validatedData.data.allDay,
		eventType: validatedData.data.eventType,
	});

	revalidatePath(`/w/${workspaceSlug}/calendar`);

	return { success: true as const, data: event };
}

export async function updateEventAction(
	workspaceSlug: string,
	projectSlug: string,
	eventId: string,
	data: UpdateEventInput,
) {
	const user = await getCurrentUser();

	const validatedData = updateEventSchema.safeParse(data);

	if (!validatedData.success) {
		return {
			success: false as const,
			message: "Invalid event data.",
		};
	}

	const access = await requireManageableEvent(
		workspaceSlug,
		projectSlug,
		eventId,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const event = await updateEvent(eventId, {
		title: validatedData.data.title,
		description: validatedData.data.description ?? null,
		startAt: validatedData.data.startAt,
		endAt: validatedData.data.endAt,
		allDay: validatedData.data.allDay,
		eventType: validatedData.data.eventType,
	});

	revalidatePath(`/w/${workspaceSlug}/calendar`);

	return { success: true as const, data: event };
}

export async function deleteEventAction(
	workspaceSlug: string,
	projectSlug: string,
	eventId: string,
) {
	const user = await getCurrentUser();

	const access = await requireManageableEvent(
		workspaceSlug,
		projectSlug,
		eventId,
		user.id,
	);

	if (!access.success) {
		return { success: false as const, message: access.message };
	}

	const event = await deleteEvent(eventId);

	revalidatePath(`/w/${workspaceSlug}/calendar`);

	return { success: true as const, data: event };
}
