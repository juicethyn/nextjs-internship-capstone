import type {
	getProjectBySlugWithRelations,
	getProjectsByWorkspace,
} from "@/lib/db/queries/projects";

export type ProjectWithRelations = Awaited<
	ReturnType<typeof getProjectsByWorkspace>
>[number];

export type ProjectDetail = NonNullable<
	Awaited<ReturnType<typeof getProjectBySlugWithRelations>>
>;
