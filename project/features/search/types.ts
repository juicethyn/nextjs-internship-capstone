import type { searchWorkspaceAction } from "@/features/search/actions/search";

export type SearchResults = Extract<
	Awaited<ReturnType<typeof searchWorkspaceAction>>,
	{ success: true }
>["data"];

export type ProjectResult = SearchResults["projects"][number];
export type TaskResult = SearchResults["tasks"][number];
export type MemberResult = SearchResults["members"][number];
