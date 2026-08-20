"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchWorkspaceAction } from "@/features/search/actions/search";
import { MIN_SEARCH_LENGTH } from "@/features/search/constants";
import type { SearchResults } from "@/features/search/types";

const EMPTY_RESULTS: SearchResults = {
	projects: [],
	tasks: [],
	members: [],
};

export function useGlobalSearch(workspaceSlug: string, term: string) {
	const isSearchable = term.length >= MIN_SEARCH_LENGTH;

	const query = useQuery({
		queryKey: ["search", workspaceSlug, term],
		queryFn: async () => {
			const result = await searchWorkspaceAction(workspaceSlug, term);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		enabled: isSearchable,
		placeholderData: keepPreviousData,
	});

	const results = query.data ?? EMPTY_RESULTS;

	const total =
		results.projects.length + results.tasks.length + results.members.length;

	return {
		results,
		total,
		isSearchable,
		isLoading: isSearchable && query.isPending,
	};
}
