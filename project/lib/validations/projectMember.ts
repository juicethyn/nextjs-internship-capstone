import { z } from "zod";

export const addProjectMembersSchema = z.object({
	userIds: z
		.array(z.uuid())
		.min(1, "Select at least one member")
		.max(50, "Too many members selected at once"),
});

export type AddProjectMembersInput = z.infer<typeof addProjectMembersSchema>;
