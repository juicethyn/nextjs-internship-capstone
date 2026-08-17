"use client";

import { useQuery } from "@tanstack/react-query";
import { getContinueWorking } from "@/features/dashboard/actions/dashboard";

export type ContinueWorkingData = Extract<
	Awaited<ReturnType<typeof getContinueWorking>>,
	{ success: true }
>["data"];

export type ContinueWorkingProject = ContinueWorkingData[number];

interface UseContinueWorkingProps {
	workspaceSlug: string;
}

export function useContinueWorking({ workspaceSlug }: UseContinueWorkingProps) {
	const query = useQuery({
		queryKey: ["dashboard", workspaceSlug, "continue-working"],
		queryFn: async () => {
			const result = await getContinueWorking(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchOnMount: "always",
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
