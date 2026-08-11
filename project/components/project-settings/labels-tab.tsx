"use client";

import { useState } from "react";
import { LabelBadge } from "@/components/labels/label-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LABEL_COLORS } from "@/constants/workspace";
import { useTaskLabels } from "@/hooks/use-task-labels";
import { createTaskLabelSchema } from "@/lib/validations/label";
import type { ProjectDetail } from "@/types/projects";

type LabelsTabProps = {
	project: ProjectDetail;
	workspaceSlug: string;
	projectSlug: string;
};

export function LabelsTab({
	project,
	workspaceSlug,
	projectSlug,
}: LabelsTabProps) {
	const isArchived = project.isArchived;

	const {
		taskLabels,
		isLoading,
		createLabel,
		isCreating,
		deleteLabel,
		deletingLabelId,
	} = useTaskLabels({
		workspaceSlug,
		projectSlug,
		// getTaskLabelsByProjectAction goes through requireActiveProject, which
		// redirects on an archived project — never fire it in that state.
		enabled: !isArchived,
	});

	const [name, setName] = useState("");
	const [color, setColor] = useState(LABEL_COLORS[0]);
	const [error, setError] = useState<string | null>(null);

	// Labels create immediately — there is no Save button on this tab.
	const handleCreate = async () => {
		const result = createTaskLabelSchema.safeParse({ name, color });

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		setError(null);

		const created = await createLabel(result.data);

		if (created.success) {
			setName("");
			setColor(LABEL_COLORS[0]);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-sm font-semibold">Card labels</h3>

				<p className="mt-1 text-sm text-muted-foreground">
					Labels you can apply to cards on this board.
				</p>
			</div>

			{isArchived ? (
				<p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
					This project is archived. Restore it to manage labels.
				</p>
			) : (
				<div className="space-y-4 rounded-lg border p-4">
					<div className="space-y-2">
						<Label htmlFor="task-label-name">New Label</Label>

						{/* Stacks on mobile, sits inline once there is room */}
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								id="task-label-name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										handleCreate();
									}
								}}
								maxLength={50}
								placeholder="e.g. Bug"
								className="sm:flex-1"
							/>

							<Button
								type="button"
								onClick={handleCreate}
								disabled={isCreating || !name.trim()}
								className="shrink-0"
							>
								{isCreating ? "Adding..." : "Add label"}
							</Button>
						</div>

						{error && <p className="text-sm text-destructive">{error}</p>}
					</div>

					<div className="space-y-2">
						<Label>Label Color</Label>

						<div className="flex flex-wrap gap-2 sm:gap-3">
							{LABEL_COLORS.map((labelColor) => (
								<button
									key={labelColor}
									type="button"
									aria-label={`Select color ${labelColor}`}
									aria-pressed={color === labelColor}
									onClick={() => setColor(labelColor)}
									className={`size-6 rounded-full transition sm:size-7 ${
										color === labelColor
											? "ring-2 ring-primary ring-offset-2"
											: ""
									}`}
									style={{
										backgroundColor: labelColor,
									}}
								/>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="space-y-2">
				<Label>Labels</Label>

				{isLoading && (
					<p className="text-sm text-muted-foreground">Loading labels...</p>
				)}

				{!isLoading && taskLabels.length === 0 && (
					<p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
						No labels yet.
						{isArchived ? "" : " Create one above to start tagging cards."}
					</p>
				)}

				{taskLabels.length > 0 && (
					<div className="board-scrollbar flex max-h-40 flex-wrap gap-2 overflow-y-auto">
						{taskLabels.map((label) => (
							<LabelBadge
								key={label.id}
								name={label.name}
								color={label.color}
								canDelete={!isArchived}
								isDeleting={deletingLabelId === label.id}
								onDelete={() => deleteLabel(label.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
