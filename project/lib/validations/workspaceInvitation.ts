import { z } from "zod";
import { invitationStatus } from "../types/workspaceInvitation";

export const createWorkspaceInvitationSchema = z.object({
	email: z.email("Invalid email address"),
	role: z.enum(["admin", "member"]),
});

export type CreateWorkspaceInvitationInput = z.infer<
	typeof createWorkspaceInvitationSchema
>;

export const updateWorkspaceInvitationSchema = z.object({
	status: z.enum(invitationStatus).optional(),
	expiresAt: z.date().optional(),
});

export type UpdateWorkspaceInvitationInput = z.infer<
	typeof updateWorkspaceInvitationSchema
>;
