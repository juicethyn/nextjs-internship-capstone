// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.4 - Build task creation and editing functionality

/*
TODO: Implementation Notes for Interns:

Modal for creating new projects with form validation.

Features to implement:
- Form with project name, description, due date
- Zod validation
- Error handling
- Loading states
- Success feedback
- Team member assignment
- Project template selection

Form fields:
- Name (required)
- Description (optional)
- Due date (optional)
- Team members (optional)
- Project template (optional)
- Privacy settings

Integration:
- Use project validation schema from lib/validations.ts
- Call project creation API
- Update project list optimistically
- Handle errors gracefully
*/

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { LabelToggle } from "@/components/labels/label-toggle";
import { Button } from "@/components/ui/button";
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

	const toggleLabel = (labelId: string) =>
		form.setValue(
			"labelIds",
			selectedLabelIds.includes(labelId)
				? selectedLabelIds.filter((id) => id !== labelId)
				: [...selectedLabelIds, labelId],
			{ shouldDirty: true, shouldValidate: true },
		);

	const onSubmit = async (data: CreateProjectInput) => {
		await createProject(data);
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>Create Project</DialogTitle>

						<DialogDescription>
							Create a new project inside your workspace. Default lists will
							automatically be generated for you.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-2">
						<div className="space-y-2">
							<Label htmlFor="name">Project Name</Label>

							<Input
								id="name"
								{...form.register("name")}
								placeholder="e.g. Fora Mobile App"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>

							<Textarea
								id="description"
								rows={4}
								{...form.register("description")}
								placeholder="Describe the purpose of this project..."
							/>
						</div>

						<div className="space-y-2">
							<Label>Project Color</Label>

							<div className="flex flex-wrap gap-3">
								{WORKSPACE_COLORS.map((projectColor) => (
									<button
										key={projectColor}
										type="button"
										onClick={() => form.setValue("color", projectColor)}
										className={`size-8 rounded-full transition ${
											selectedColor === projectColor
												? "ring-2 ring-primary ring-offset-2"
												: ""
										}`}
										style={{
											backgroundColor: projectColor,
										}}
									/>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<Label>Labels</Label>

							{isLoadingLabels && (
								<p className="text-sm text-muted-foreground">
									Loading labels...
								</p>
							)}

							{!isLoadingLabels && labels.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No labels yet — create them in Workspace Settings to reuse
									across projects.
								</p>
							)}

							{labels.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{labels.map((label) => (
										<LabelToggle
											key={label.id}
											name={label.name}
											color={label.color}
											selected={selectedLabelIds.includes(label.id)}
											onToggle={() => toggleLabel(label.id)}
										/>
									))}
								</div>
							)}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="start-date">Start Date</Label>

								<div className="relative">
									<Input
										id="start-date"
										type="date"
										{...form.register("startDate")}
									/>

									<CalendarIcon className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="due-date">Due Date</Label>

								<div className="relative">
									<Input
										id="due-date"
										type="date"
										{...form.register("dueDate")}
									/>

									<CalendarIcon className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
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
