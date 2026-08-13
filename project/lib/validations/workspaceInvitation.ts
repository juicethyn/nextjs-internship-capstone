import { z } from "zod";
import { invitationStatus } from "@/lib/db/types";

export const createWorkspaceInvitationSchema = z.object({
	email: z.email("Invalid email address"),
	role: z.enum(["owner", "admin", "member"]),
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
