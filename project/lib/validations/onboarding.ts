import { z } from "zod";
import { occupationEnum } from "../db/schema";
import { createWorkspaceSchema } from "./workspace";

export const onboardingSchema = z.object({
	workspace: createWorkspaceSchema,

	invites: z.array(
		z.object({
			email: z.email(),
		}),
	),

	occupation: z.enum(occupationEnum.enumValues),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;
