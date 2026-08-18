import z from "zod";
import { eventTypes } from "@/lib/db/types";

const DESCRIPTION_MAX_LENGTH = 5_000;

const eventFields = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z
		.string()
		.max(DESCRIPTION_MAX_LENGTH, "Description too long")
		.nullable()
		.optional(),
	eventType: z.enum(eventTypes).default("meeting"),
	allDay: z.boolean().default(false),
	startAt: z.coerce.date(),
	endAt: z.coerce.date(),
});

export const createEventSchema = eventFields.refine(
	(value) => value.endAt >= value.startAt,
	{ message: "End must be on or after the start", path: ["endAt"] },
);

export type CreateEventInput = z.infer<typeof createEventSchema>;
