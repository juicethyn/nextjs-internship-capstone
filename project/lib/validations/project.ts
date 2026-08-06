import { z } from "zod";

const optionalDate = z
	.union([z.coerce.date<string>(), z.literal("")])
	.optional()
	.transform((val) => (val === "" ? undefined : val));

// ======================= PROJECT VALIDATION SCHEMA =======================

export const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color"),
	logoUrl: z.url("Invalid URL").optional(),
	startDate: optionalDate,
	dueDate: optionalDate.refine(
		(val) => {
			if (!val) return true;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return val >= today;
		},
		{ message: "Due date must be in the future" },
	),
});

export type CreateProjectFormInput = z.input<typeof createProjectSchema>;
export type CreateProjectInput = z.output<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
