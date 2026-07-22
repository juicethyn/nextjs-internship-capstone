import z from "zod";

export const updateUserSchema = z.object({
	firstName: z
		.string()
		.min(1, "First name is required")
		.max(50, "First name too long"),
	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(50, "Last name too long"),
	imageUrl: z.url("Invalid image URL").optional(),
	jobTitle: z.enum([
		"software_engineer",
		"product_manager",
		"designer",
		"qa_engineer",
		"devops_engineer",
		"other",
	]),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
