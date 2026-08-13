"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LABEL_COLORS } from "@/constants/workspace";
import { useWorkspaceLabels } from "@/hooks/use-workspace-labels";
import { createWorkspaceLabelSchema } from "@/lib/validations/label";
import { LabelBadge } from "../labels/label-badge";

type LabelsTabProps = {
	workspaceSlug: string;
	canEdit: boolean;
};

export function LabelsTab({ workspaceSlug, canEdit }: LabelsTabProps) {
	const {
		labels,
		isLoading,
		createLabel,
		isCreating,
		deleteLabel,
		deletingLabelId,
	} = useWorkspaceLabels(workspaceSlug);

	const [name, setName] = useState("");
	const [color, setColor] = useState(LABEL_COLORS[0]);
	const [error, setError] = useState<string | null>(null);

	// Labels create immediately — there is no Save button on this tab.
	const handleCreate = async () => {
		const result = createWorkspaceLabelSchema.safeParse({ name, color });

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
			{canEdit && (
				<div className="space-y-4 rounded-lg border p-4">
					<div className="space-y-2">
						<Label htmlFor="label-name">New Label</Label>

						{/* Stacks on mobile, sits inline once there is room */}
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								id="label-name"
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

				{!isLoading && labels.length === 0 && (
					<p className="rounded-lg p-6 text-center text-sm text-muted-foreground">
						No labels yet.
						{canEdit
							? " Create one above to start organizing your projects."
							: ""}
					</p>
				)}

				{labels.length > 0 && (
					<div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
						{labels.map((label) => (
							<LabelBadge
								key={label.id}
								name={label.name}
								color={label.color}
								canDelete={canEdit}
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
