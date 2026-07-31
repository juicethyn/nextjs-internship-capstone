import { z } from "zod";

// Workspace Labels

export const createWorkspaceLabelSchema = z.object({
	name: z
		.string()
		.min(1, "Label name is required")
		.max(50, "Label name is too long"),

	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
});

export type CreateWorkspaceLabelInput = z.infer<
	typeof createWorkspaceLabelSchema
>;

export const updateWorkspaceLabelSchema = createWorkspaceLabelSchema.partial();

export type UpdateWorkspaceLabelInput = z.infer<
	typeof updateWorkspaceLabelSchema
>;

// Task Labels

export const createTaskLabelSchema = z.object({
	name: z
		.string()
		.min(1, "Label name is required")
		.max(50, "Label name is too long"),

	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
});

export type CreateTaskLabelInput = z.infer<typeof createTaskLabelSchema>;

export const updateTaskLabelSchema = createTaskLabelSchema.partial();

export type UpdateTaskLabelInput = z.infer<typeof updateTaskLabelSchema>;
