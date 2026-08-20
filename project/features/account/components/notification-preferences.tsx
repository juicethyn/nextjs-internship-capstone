"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "@/features/account/hooks/use-notification-settings";
import type { NotificationCategory } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import type { NotificationSettingsInput } from "@/lib/validations/user";

const CATEGORY_OPTIONS = [
	{
		value: "workspace",
		label: "Workspace",
		description: "Invitations, role changes, and membership updates",
	},
	{
		value: "project",
		label: "Projects",
		description: "Project membership and lead changes",
	},
	{
		value: "task",
		label: "Tasks",
		description: "Assignments, due dates, and comments",
	},
] as const;

type NotificationPreferencesProps = {
	notificationsMuted: boolean;
	mutedCategories: NotificationCategory[];
};

export function NotificationPreferences({
	notificationsMuted,
	mutedCategories,
}: NotificationPreferencesProps) {
	const { updateNotificationSettings, isUpdating } = useNotificationSettings();

	const [settings, setSettings] = useState<NotificationSettingsInput>({
		notificationsMuted,
		mutedNotificationCategories: mutedCategories,
	});

	const save = async (next: NotificationSettingsInput) => {
		const previous = settings;

		setSettings(next);

		const result = await updateNotificationSettings(next);

		if (!result.success) {
			setSettings(previous);
		}
	};

	const toggleMuteAll = (muted: boolean) =>
		save({ ...settings, notificationsMuted: muted });

	const toggleCategory = (category: NotificationCategory, enabled: boolean) =>
		save({
			...settings,
			mutedNotificationCategories: enabled
				? settings.mutedNotificationCategories.filter(
						(item) => item !== category,
					)
				: [...settings.mutedNotificationCategories, category],
		});

	return (
		<div className="space-y-6">
			<div className="space-y-3 rounded-lg border p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="mute-all" className="text-sm font-semibold">
							Mute all notifications
						</Label>

						<p className="mt-1 text-sm text-muted-foreground">
							Stop receiving new notifications everywhere. Anything already in
							your inbox stays there.
						</p>
					</div>

					<Switch
						id="mute-all"
						checked={settings.notificationsMuted}
						onCheckedChange={toggleMuteAll}
						disabled={isUpdating}
					/>
				</div>
			</div>

			<div
				className={cn(
					"space-y-3 rounded-lg border p-4 transition-opacity",
					settings.notificationsMuted && "opacity-60",
				)}
			>
				<div>
					<h3 className="text-sm font-semibold">What you get notified about</h3>

					<p className="mt-1 text-sm text-muted-foreground">
						Choose which activity reaches your notification bell.
					</p>
				</div>

				<div className="space-y-2">
					{CATEGORY_OPTIONS.map((option) => {
						const isEnabled = !settings.mutedNotificationCategories.includes(
							option.value,
						);

						return (
							<div
								key={option.value}
								className="flex items-start justify-between gap-4 rounded-xl border bg-muted p-3"
							>
								<div className="min-w-0 space-y-0.5">
									<Label htmlFor={`category-${option.value}`}>
										{option.label}
									</Label>

									<p className="text-xs text-muted-foreground">
										{option.description}
									</p>
								</div>

								<Switch
									id={`category-${option.value}`}
									checked={isEnabled}
									onCheckedChange={(checked) =>
										toggleCategory(option.value, checked)
									}
									disabled={isUpdating || settings.notificationsMuted}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
