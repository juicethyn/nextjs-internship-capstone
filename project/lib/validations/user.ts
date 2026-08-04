import z from "zod";

export const updateUserSchema = z
	.object({
		firstName: z
			.string()
			.min(1, "First name is required")
			.max(50, "First name too long"),
		lastName: z
			.string()
			.min(1, "Last name is required")
			.max(50, "Last name too long"),
		imageUrl: z.url("Invalid image URL").optional(),
		occupation: z.enum([
			"software_engineer",
			"product_manager",
			"designer",
			"qa_engineer",
			"devops_engineer",
			"student",
			"other",
		]),
		lastWorkspaceId: z.uuid("Invalid workspace ID").nullable().optional(),
		currentWorkspaceId: z.uuid("Invalid workspace ID").nullable().optional(),
	})
	.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
