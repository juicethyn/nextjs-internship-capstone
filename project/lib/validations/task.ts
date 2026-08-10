import z from "zod";
import { taskPriorities } from "../../types/task";

const taskFields = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	description: z.string().max(1000, "Description too long").optional(),
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
