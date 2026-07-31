import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	logoUrl: z.url("Invalid logo URL").optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
