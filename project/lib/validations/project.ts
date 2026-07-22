import { z } from "zod";

// ======================= PROJECT VALIDATION SCHEMA =======================
export const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	dueDate: z
		.date()
		.min(new Date(), "Due date must be in the future")
		.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
