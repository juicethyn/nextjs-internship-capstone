"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createEventAction,
	deleteEventAction,
	updateEventAction,
} from "@/features/calendar/actions/events";
import type {
	CreateEventInput,
	UpdateEventInput,
} from "@/lib/validations/event";

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

	const updateMutation = useMutation({
		mutationFn: async ({
			projectSlug,
			eventId,
			data,
		}: {
			projectSlug: string;
			eventId: string;
			data: UpdateEventInput;
		}) => {
			const result = await updateEventAction(
				workspaceSlug,
				projectSlug,
				eventId,
				data,
			);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["calendar", workspaceSlug] });

			toast.success("Event updated");
		},
		onError: (error) => {
			toast.error(error.message || "Could not update the event.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async ({
			projectSlug,
			eventId,
		}: {
			projectSlug: string;
			eventId: string;
		}) => {
			const result = await deleteEventAction(
				workspaceSlug,
				projectSlug,
				eventId,
			);

			if (!result.success) throw new Error(result.message);

			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["calendar", workspaceSlug] });

			toast.success("Event deleted");
		},
		onError: (error) => {
			toast.error(error.message || "Could not delete the event.");
		},
	});

	return {
		createEvent: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateEvent: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteEvent: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
}
