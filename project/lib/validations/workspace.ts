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

// updateWorkspaceSchema is all-optional, so `{}` validates and would issue a
// no-op UPDATE. The settings form needs both fields present, and reuses the
// error messages that only createWorkspaceSchema carries.
export const workspaceGeneralSettingsSchema = createWorkspaceSchema.pick({
	name: true,
	color: true,
});

export type WorkspaceGeneralSettingsInput = z.infer<
	typeof workspaceGeneralSettingsSchema
>;
