"use client";

import { useQuery } from "@tanstack/react-query";
import { getCalendarData } from "@/features/calendar/actions/calendar";

export type CalendarData = Extract<
	Awaited<ReturnType<typeof getCalendarData>>,
	{ success: true }
>["data"];

export type CalendarProjectOption = CalendarData["projects"][number];

interface UseCalendarDeadlinesProps {
	workspaceSlug: string;
}

export function useCalendarDeadlines({
	workspaceSlug,
}: UseCalendarDeadlinesProps) {
	const query = useQuery({
		queryKey: ["calendar", workspaceSlug],
		queryFn: async () => {
			const result = await getCalendarData(workspaceSlug);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		refetchOnMount: "always",
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
}
