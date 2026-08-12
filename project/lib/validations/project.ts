import { z } from "zod";

const optionalDate = z
	.union([z.coerce.date<string>(), z.literal("")])
	.optional()
	.transform((val) => (val === "" ? undefined : val));

// ======================= PROJECT VALIDATION SCHEMA =======================

export const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	color: z
		.string()
		.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color"),
	logoUrl: z.url("Invalid URL").optional(),
	startDate: optionalDate,
	dueDate: optionalDate.refine(
		(val) => {
			if (!val) return true;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return val >= today;
		},
		{ message: "Due date must be in the future" },
	),

	// labelIds is not part of the database schema, but we include it here so that we can validate it in the same place as the rest of the project data. It will be stripped out before we insert into the database.
	labelIds: z.array(z.uuid()).default([]),
});

export type CreateProjectFormInput = z.input<typeof createProjectSchema>;
export type CreateProjectInput = z.output<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ======================= PROJECT SETTINGS VALIDATION SCHEMA =======================
// Idea is to have a separate schema for project settings, so that we can validate the data separately from the create/update project schemas. This is useful for when we want to update only the settings of a project, without having to validate the entire project data.
export const projectGeneralSettingsSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(100, "Name too long"),
		description: z.string().max(500, "Description too long").optional(),
		color: z
			.string()
			.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid color"),

		startDate: z.date().optional(),
		dueDate: z.date().optional(),
	})
	.refine(
		(data) => {
			if (!data.startDate || !data.dueDate) return true;
			return data.dueDate >= data.startDate;
		},
		{
			message: "Due date must be on or after the start date",
			path: ["dueDate"],
		},
	);

export type ProjectGeneralSettingsInput = z.infer<
	typeof projectGeneralSettingsSchema
>;
