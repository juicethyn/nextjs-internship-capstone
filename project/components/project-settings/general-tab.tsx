"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ProjectColorPicker } from "@/components/project/project-color-picker";
import { ProjectStatusBadge } from "@/components/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { useProjectSettings } from "@/hooks/use-project-settings";
import {
	type ProjectGeneralSettingsInput,
	projectGeneralSettingsSchema,
} from "@/lib/validations/project";
import type { ProjectDetail } from "@/types/projects";

type GeneralTabProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
	canManage: boolean;
};

function toFormValues(project: ProjectDetail): ProjectGeneralSettingsInput {
	return {
		name: project.name,
		description: project.description ?? undefined,
		color: project.color,
		startDate: project.startDate ?? undefined,
		dueDate: project.dueDate ?? undefined,
	};
}

export function GeneralTab({
	project,
	workspaceSlug,
	projectSlug,
	canManage,
}: GeneralTabProps) {
	const { updateProject, isUpdating } = useProjectSettings({
		workspaceSlug,
		projectSlug,
	});

	const form = useForm<ProjectGeneralSettingsInput>({
		resolver: zodResolver(projectGeneralSettingsSchema),
		mode: "onChange",
		defaultValues: toFormValues(project),
	});

	const { reset } = form;

	// Keep the form in step with refetched project data while it is untouched.
	useEffect(() => {
		if (!form.formState.isDirty) {
			reset(toFormValues(project));
		}
	}, [project, reset, form.formState.isDirty]);

	const name = form.watch("name");
	const color = form.watch("color");

	const isArchived = project.isArchived;
	const isEditable = canManage && !isArchived;

	const onSubmit = async (data: ProjectGeneralSettingsInput) => {
		const result = await updateProject(data);

		if (result.success) {
			reset(data);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<div className="flex min-w-0 items-center gap-4 rounded-2xl border bg-muted p-4">
				<WorkspaceAvatar name={name || "P"} color={color} size="md" />

				<div className="min-w-0 flex-1">
					<h3 className="truncate text-base font-semibold">
						{name || "Project"}
					</h3>

					<p className="text-xs text-muted-foreground">
						This is how your project will appear.
					</p>
				</div>

				<div className="shrink-0">
					<Controller
						control={form.control}
						name="color"
						render={({ field }) => (
							<ProjectColorPicker
								value={field.value}
								onChange={(next) =>
									form.setValue("color", next, {
										shouldDirty: true,
										shouldValidate: true,
									})
								}
							/>
						)}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="project-name">Project name</Label>

				<Input
					id="project-name"
					{...form.register("name")}
					maxLength={100}
					disabled={!isEditable}
					placeholder="e.g. Mobile App Revamp"
				/>

				{form.formState.errors.name && (
					<p className="text-sm text-destructive">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="project-description">
					Description
					<span className="text-xs font-normal text-muted-foreground">
						(optional)
					</span>
				</Label>

				<Textarea
					id="project-description"
					{...form.register("description")}
					maxLength={500}
					rows={3}
					disabled={!isEditable}
					placeholder="What is this project about?"
					className="resize-none"
				/>

				{form.formState.errors.description && (
					<p className="text-sm text-destructive">
						{form.formState.errors.description.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label>Status</Label>

				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<ProjectStatusBadge status={project.status} />

					<p className="min-w-0 text-xs text-muted-foreground">
						Set automatically. A project is completed when every task has
						reached a Done list.
					</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="min-w-0 space-y-2">
					<Label htmlFor="project-start-date">
						Start date
						<span className="text-xs font-normal text-muted-foreground">
							(optional)
						</span>
					</Label>

					<Controller
						control={form.control}
						name="startDate"
						render={({ field }) => (
							<DatePicker
								id="project-start-date"
								value={field.value}
								onChange={field.onChange}
								disabled={!isEditable}
								placeholder="Not set"
							/>
						)}
					/>
				</div>

				<div className="min-w-0 space-y-2">
					<Label htmlFor="project-due-date">
						Due date
						<span className="text-xs font-normal text-muted-foreground">
							(optional)
						</span>
					</Label>

					<Controller
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<DatePicker
								id="project-due-date"
								value={field.value}
								onChange={field.onChange}
								disabled={!isEditable}
								placeholder="Not set"
							/>
						)}
					/>

					{form.formState.errors.dueDate && (
						<p className="text-sm text-destructive">
							{form.formState.errors.dueDate.message}
						</p>
					)}
				</div>
			</div>

			{!canManage && (
				<p className="text-sm text-muted-foreground">
					Only the project lead or a workspace owner/admin can change these
					settings.
				</p>
			)}

			{canManage && isArchived && (
				<p className="text-sm text-muted-foreground">
					This project is archived. Restore it from the Danger tab to make
					changes.
				</p>
			)}

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={
						!isEditable ||
						isUpdating ||
						!form.formState.isDirty ||
						!form.formState.isValid
					}
					className="w-full sm:w-auto"
				>
					{isUpdating ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
