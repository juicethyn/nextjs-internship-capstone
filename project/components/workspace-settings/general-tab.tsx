"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { WORKSPACE_COLORS } from "@/constants/workspace";
import { useWorkspaceSettings } from "@/hooks/use-workspace-settings";
import {
	type WorkspaceGeneralSettingsInput,
	workspaceGeneralSettingsSchema,
} from "@/lib/validations/workspace";
import type { WorkspaceItem } from "@/types/workspace";

type GeneralTabProps = {
	workspace: WorkspaceItem;
	canEdit: boolean;
};

export function GeneralTab({ workspace, canEdit }: GeneralTabProps) {
	const { updateWorkspace, isUpdating } = useWorkspaceSettings(workspace.slug);

	const form = useForm<WorkspaceGeneralSettingsInput>({
		resolver: zodResolver(workspaceGeneralSettingsSchema),
		mode: "onChange",
		defaultValues: {
			name: workspace.name,
			color: workspace.color,
		},
	});

	const name = form.watch("name");
	const selectedColor = form.watch("color");

	const onSubmit = async (data: WorkspaceGeneralSettingsInput) => {
		await updateWorkspace(data);

		form.reset(data);
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<div className="rounded-2xl border bg-muted p-4">
				<div className="flex items-center gap-4">
					<WorkspaceAvatar name={name || "F"} color={selectedColor} size="md" />

					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-semibold">
							{name || "Workspace"}
						</h3>

						<p className="text-xs text-muted-foreground">
							This is how your workspace will appear.
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="workspace-name">Workspace Name</Label>

				<Input
					id="workspace-name"
					{...form.register("name")}
					maxLength={50}
					disabled={!canEdit}
					placeholder="e.g. Fora"
				/>

				{form.formState.errors.name && (
					<p className="text-sm text-destructive">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label>Workspace Color</Label>

				<div className="flex flex-wrap gap-3">
					{WORKSPACE_COLORS.map((workspaceColor) => (
						<button
							key={workspaceColor}
							type="button"
							disabled={!canEdit}
							aria-label={`Select color ${workspaceColor}`}
							aria-pressed={selectedColor === workspaceColor}
							onClick={() =>
								form.setValue("color", workspaceColor, {
									shouldDirty: true,
									shouldValidate: true,
								})
							}
							className={`size-8 rounded-full transition disabled:opacity-50 ${
								selectedColor === workspaceColor
									? "ring-2 ring-primary ring-offset-2"
									: ""
							}`}
							style={{
								backgroundColor: workspaceColor,
							}}
						/>
					))}
				</div>
			</div>

			{!canEdit && (
				<p className="text-sm text-muted-foreground">
					Only the workspace owner can change these settings.
				</p>
			)}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={
						!canEdit ||
						isUpdating ||
						!form.formState.isDirty ||
						!form.formState.isValid
					}
				>
					{isUpdating ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
