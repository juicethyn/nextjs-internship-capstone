import z from "zod";
import { taskPriorities } from "../../types/task";

export const createTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
	assigneeId: z.uuid().optional(),
	priority: z.enum(taskPriorities).default("none"),
	startDate: z.coerce.date().optional(),
	dueDate: z.coerce
		.date()
		.min(new Date(), "Due date must be in the future")
		.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
