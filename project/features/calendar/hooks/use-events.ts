"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEventAction } from "@/features/calendar/actions/events";
import type { CreateEventInput } from "@/lib/validations/event";

interface UseEventsProps {
	workspaceSlug: string;
}

export function useEvents({ workspaceSlug }: UseEventsProps) {
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: async ({
			projectSlug,
			data,
		}: {
			projectSlug: string;
			data: CreateEventInput;
		}) => {
			const result = await createEventAction(workspaceSlug, projectSlug, data);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["calendar", workspaceSlug] });

			toast.success("Event created");
		},
		onError: (error) => {
			toast.error(error.message || "Could not create the event.");
		},
	});

	return {
		createEvent: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
	};
}
