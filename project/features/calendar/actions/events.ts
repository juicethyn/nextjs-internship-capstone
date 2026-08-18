"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createEvent } from "@/lib/db/queries/calendar";
import { requireActiveProject } from "@/lib/permission";
import {
	type CreateEventInput,
	createEventSchema,
} from "@/lib/validations/event";

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
