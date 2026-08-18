import z from "zod";
import { eventTypes } from "@/lib/db/types";

export const EVENT_DESCRIPTION_MAX_LENGTH = 500;

const eventFields = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z
		.string()
		.max(EVENT_DESCRIPTION_MAX_LENGTH, "Description too long")
		.nullable()
		.optional(),
	eventType: z.enum(eventTypes).default("meeting"),
	allDay: z.boolean().default(false),
	startAt: z.coerce.date(),
	endAt: z.coerce.date(),
});

const withOrderedRange = <T extends typeof eventFields>(schema: T) =>
	schema.refine((value) => value.endAt >= value.startAt, {
		message: "End must be on or after the start",
		path: ["endAt"],
	});

export const createEventSchema = withOrderedRange(eventFields);

export const updateEventSchema = withOrderedRange(eventFields);

export type CreateEventInput = z.infer<typeof createEventSchema>;

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
