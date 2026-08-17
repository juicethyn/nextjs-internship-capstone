import type { JSONContent } from "@tiptap/react";
import z from "zod";
import { taskPriorities } from "@/lib/db/types";

const DESCRIPTION_MAX_LENGTH = 100_000;

const descriptionSchema = z
	.custom<JSONContent>(
		(value) =>
			typeof value === "object" && value !== null && !Array.isArray(value),
		"Invalid description",
	)
	.nullable()
	.optional()
	.refine(
		(value) =>
			value == null || JSON.stringify(value).length <= DESCRIPTION_MAX_LENGTH,
		"Description too long",
	);

const taskFields = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: descriptionSchema,
	assigneeId: z.uuid().nullable().optional(),
	priority: z.enum(taskPriorities).default("none"),
	startDate: z.coerce.date().nullable().optional(),
	dueDate: z.coerce.date().nullable().optional(),
});

export const createTaskSchema = taskFields.refine(
	(value) => {
		if (!value.dueDate) return true;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return value.dueDate >= today;
	},
	{ message: "Due date must be in the future", path: ["dueDate"] },
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = taskFields.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
