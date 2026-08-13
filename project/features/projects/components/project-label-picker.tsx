"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { LabelToggle } from "@/features/labels/components/label-toggle";
import type { WorkspaceLabel } from "@/features/labels/types";

type ProjectLabelPickerProps = {
	labels: WorkspaceLabel[];
	selectedLabelIds: string[];
	onToggle: (labelId: string) => void;
	isLoading?: boolean;
};

export function ProjectLabelPicker({
	labels,
	selectedLabelIds,
	onToggle,
	isLoading = false,
}: ProjectLabelPickerProps) {
	const selectedCount = selectedLabelIds.length;

	return (
		<Popover modal>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-1.5"
					disabled={isLoading || labels.length === 0}
				>
					<Plus className="size-4" />
					Labels
					{selectedCount > 0 && (
						<span className="text-muted-foreground">({selectedCount})</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-[calc(100vw-2rem)] p-3 sm:w-80">
				<div className="space-y-3">
					<div>
						<h4 className="font-medium">Select Labels</h4>

						<p className="text-xs text-muted-foreground">
							Assign one or more labels to this project.
						</p>
					</div>

					<div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1">
						{labels.map((label) => (
							<LabelToggle
								key={label.id}
								name={label.name}
								color={label.color}
								selected={selectedLabelIds.includes(label.id)}
								onToggle={() => onToggle(label.id)}
							/>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
