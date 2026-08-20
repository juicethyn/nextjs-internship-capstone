"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateNotificationSettingsAction } from "@/features/account/actions/account";
import type { NotificationSettingsInput } from "@/lib/validations/user";

export function useNotificationSettings() {
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: NotificationSettingsInput) =>
			updateNotificationSettingsAction(data),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to update notifications.");
				return;
			}

			router.refresh();
			toast.success("Notification settings saved.");
		},
		onError: () => toast.error("Failed to update notifications."),
	});

	return {
		updateNotificationSettings: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
	};
}
