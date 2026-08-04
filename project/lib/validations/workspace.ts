import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z
		.string()
		.min(2, "Workspace name must be at least 2 characters")
		.max(50, "Workspace name must be less than 50 characters"),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid workspace color"),
	logoUrl: z.url("Invalid logo URL").optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
	name: z.string().min(2).max(50).optional(),

	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/)
		.optional(),

	logoUrl: z.url().optional(),

	setupCompleted: z.boolean().optional(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
