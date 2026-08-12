"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { LabelBadge } from "@/components/labels/label-badge";
import { OptionalTag } from "@/components/optional-tag";
import { ProjectColorPicker } from "@/components/project/project-color-picker";
import { ProjectLabelPicker } from "@/components/project/project-label-picker";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WORKSPACE_COLORS } from "@/constants/workspace";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaceLabels } from "@/hooks/use-workspace-labels";
import {
	type CreateProjectFormInput,
	type CreateProjectInput,
	createProjectSchema,
} from "@/lib/validations/project";

const DESCRIPTION_MAX_LENGTH = 500;

const DATE_VALUE_FORMAT = "yyyy-MM-dd";

function toDateValue(value?: string) {
	if (!value) return null;

	const parsed = parse(value, DATE_VALUE_FORMAT, new Date());

	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

type CreateProjectModalProps = {
	workspaceSlug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreateProjectModal({
	workspaceSlug,
	open,
	onOpenChange,
}: CreateProjectModalProps) {
	const { createProject, isCreating } = useProjects({ workspaceSlug });

	const { labels, isLoading: isLoadingLabels } =
		useWorkspaceLabels(workspaceSlug);

	const form = useForm<CreateProjectFormInput, unknown, CreateProjectInput>({
		resolver: zodResolver(createProjectSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			description: "",
			color: WORKSPACE_COLORS[0],
			startDate: undefined,
			dueDate: undefined,
			labelIds: [],
		},
	});

	const selectedColor = form.watch("color");
	const selectedLabelIds = form.watch("labelIds") ?? [];
	const description = form.watch("description") ?? "";
	const startDate = form.watch("startDate");
	const dueDate = form.watch("dueDate");
	const errors = form.formState.errors;

	const selectedLabels = labels.filter((label) =>
		selectedLabelIds.includes(label.id),
	);

	const toggleLabel = (labelId: string) =>
		form.setValue(
			"labelIds",
			selectedLabelIds.includes(labelId)
				? selectedLabelIds.filter((id) => id !== labelId)
				: [...selectedLabelIds, labelId],
			{ shouldDirty: true, shouldValidate: true },
		);

	const setDateField = (field: "startDate" | "dueDate", date?: Date) => {
		form.setValue(field, date ? format(date, DATE_VALUE_FORMAT) : undefined, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const onSubmit = async (data: CreateProjectInput) => {
		await createProject(data);
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<DialogHeader className="shrink-0 border-b px-5 py-4 sm:px-6">
						<DialogTitle className="text-base sm:text-lg">
							Create Project
						</DialogTitle>

						<DialogDescription className="text-xs lg:text-base">
							Create a new project inside your workspace.
						</DialogDescription>
					</DialogHeader>

					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
						<div className="space-y-2">
							<Label htmlFor="name">Project Name</Label>

							<Input
								id="name"
								{...form.register("name")}
								maxLength={100}
								placeholder="e.g. Fora Mobile App"
								aria-invalid={!!errors.name}
							/>

							{errors.name && (
								<p className="text-sm text-destructive">
									{errors.name.message}
								</p>
							)}
						</div>

						<div className="space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<ProjectColorPicker
									value={selectedColor}
									onChange={(color) =>
										form.setValue("color", color, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
								/>

								<ProjectLabelPicker
									labels={labels}
									selectedLabelIds={selectedLabelIds}
									onToggle={toggleLabel}
									isLoading={isLoadingLabels}
								/>
							</div>

							{!isLoadingLabels && labels.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No labels yet. Create labels in Workspace Settings to reuse
									them across projects.
								</p>
							)}

							{selectedLabels.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{selectedLabels.map((label) => (
										<LabelBadge
											key={label.id}
											name={label.name}
											color={label.color}
											canDelete
											onDelete={() => toggleLabel(label.id)}
										/>
									))}
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">
								Description
								<OptionalTag />
							</Label>

							<Textarea
								id="description"
								{...form.register("description")}
								maxLength={DESCRIPTION_MAX_LENGTH}
								placeholder="Describe the purpose of this project..."
								aria-invalid={!!errors.description}
								className="max-h-40 min-h-24"
							/>

							<div className="flex items-start justify-between gap-2">
								<p className="text-sm text-destructive">
									{errors.description?.message}
								</p>

								<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
									{description.length}/{DESCRIPTION_MAX_LENGTH}
								</span>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="project-start-date">
									Start date
									<OptionalTag />
								</Label>

								<DatePicker
									id="project-start-date"
									value={toDateValue(startDate)}
									onChange={(date) => setDateField("startDate", date)}
								/>

								{errors.startDate && (
									<p className="text-sm text-destructive">
										{errors.startDate.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="project-due-date">
									Due date
									<OptionalTag />
								</Label>

								<DatePicker
									id="project-due-date"
									value={toDateValue(dueDate)}
									onChange={(date) => setDateField("dueDate", date)}
								/>

								{errors.dueDate && (
									<p className="text-sm text-destructive">
										{errors.dueDate.message}
									</p>
								)}
							</div>
						</div>
					</div>

					<DialogFooter className="m-0 shrink-0 border-t px-5 py-4 sm:px-6">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={isCreating || !form.formState.isValid}
						>
							{isCreating ? "Creating..." : "Create Project"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
