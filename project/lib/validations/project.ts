import { z } from "zod";

// ======================= PROJECT VALIDATION SCHEMA =======================
export const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color"),
	logoUrl: z.string().url("Invalid URL").optional(),
	status: z.enum(["active", "archived", "completed"]).optional(),
	startDate: z.date().optional(),
	dueDate: z
		.date()
		.min(new Date(), "Due date must be in the future")
		.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
