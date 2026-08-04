import { z } from "zod";
import { workspaceMemberRoles } from "@/types/workspace";

export const createWorkspaceMemberSchema = z.object({
	workspaceId: z.string().min(1, "Workspace ID is required"),
	userId: z.string().min(1, "User ID is required"),
	role: z.enum(workspaceMemberRoles),
});

export type CreateWorkspaceMemberInput = z.infer<
	typeof createWorkspaceMemberSchema
>;

export const updateWorkspaceMemberSchema =
	createWorkspaceMemberSchema.partial();

export type UpdateWorkspaceMemberInput = z.infer<
	typeof updateWorkspaceMemberSchema
>;
