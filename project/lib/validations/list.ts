import { z } from "zod";
import { creatableListTypes } from "@/lib/db/types";

export const createListSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	type: z.enum(creatableListTypes).optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = createListSchema.partial();

export type UpdateListInput = z.infer<typeof updateListSchema>;
