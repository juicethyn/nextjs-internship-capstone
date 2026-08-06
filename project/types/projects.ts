import type { getProjectsByWorkspace } from "@/lib/db/queries/projects";

export type ProjectWithRelations = Awaited<
	ReturnType<typeof getProjectsByWorkspace>
>[number];
