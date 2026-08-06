import { z } from "zod";
import { occupationEnum } from "../db/schema";
import { createWorkspaceSchema } from "./workspace";
import { createWorkspaceInvitationSchema } from "./workspaceInvitation";

export const onboardingSchema = z.object({
	workspace: createWorkspaceSchema,
	invites: z.array(createWorkspaceInvitationSchema),
	occupation: z.enum(occupationEnum.enumValues),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;
