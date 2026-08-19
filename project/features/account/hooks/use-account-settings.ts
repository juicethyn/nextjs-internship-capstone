"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	syncAvatarAction,
	updateProfileAction,
} from "@/features/account/actions/account";
import type { ProfileSettingsInput } from "@/lib/validations/user";

export function useAccountSettings() {
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: ProfileSettingsInput) => updateProfileAction(data),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to update profile.");
				return;
			}

			router.refresh();
			toast.success("Profile updated.");
		},
		onError: () => toast.error("Failed to update profile."),
	});

	const avatarMutation = useMutation({
		mutationFn: (imageUrl: string) => syncAvatarAction(imageUrl),
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.message ?? "Failed to update avatar.");
				return;
			}

			router.refresh();
			toast.success("Avatar updated.");
		},
		onError: () => toast.error("Failed to update avatar."),
	});

	return {
		updateProfile: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		syncAvatar: avatarMutation.mutateAsync,
		isSyncingAvatar: avatarMutation.isPending,
	};
}
