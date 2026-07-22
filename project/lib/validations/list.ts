import { z } from "zod";

export const createListSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = createListSchema.partial();

export type UpdateListInput = z.infer<typeof updateListSchema>;
