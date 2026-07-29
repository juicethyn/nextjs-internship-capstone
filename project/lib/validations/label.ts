import { z } from "zod";

export const createLabelSchema = z.object({
	name: z
		.string()
		.min(1, "Label name is required")
		.max(50, "Label name is too long"),

	color: z
		.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;

export const updateLabelSchema = createLabelSchema.partial();

export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
