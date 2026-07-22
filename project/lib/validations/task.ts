import z from "zod";

export const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
	assigneeId: z.uuid().optional(),
	priority: z.enum(["low", "medium", "high"]),
	dueDate: z.coerce
		.date()
		.min(new Date(), "Due date must be in the future")
		.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
