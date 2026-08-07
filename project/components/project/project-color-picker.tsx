"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { WORKSPACE_COLORS } from "@/constants/workspace";

type ProjectColorPickerProps = {
	value: string;
	onChange: (color: string) => void;
};

export function ProjectColorPicker({
	value,
	onChange,
}: ProjectColorPickerProps) {
	const [open, setOpen] = useState(false);

	const handleSelect = (color: string) => {
		onChange(color);
		setOpen(false);
	};

	return (
		<Popover modal open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="outline" size="sm" className="gap-2">
					<span
						className="size-4 shrink-0 rounded-full"
						style={{ backgroundColor: value }}
					/>
					Color
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-[calc(100vw-2rem)] p-3 sm:w-64">
				<div className="space-y-3">
					<div>
						<h4 className="font-medium">Project Color</h4>

						<p className="text-xs text-muted-foreground">
							Used for the project avatar and progress bar.
						</p>
					</div>

					<div className="grid grid-cols-7 gap-2">
						{WORKSPACE_COLORS.map((projectColor) => (
							<button
								key={projectColor}
								type="button"
								aria-label={`Select color ${projectColor}`}
								aria-pressed={value === projectColor}
								onClick={() => handleSelect(projectColor)}
								className={`size-7 rounded-full transition ${
									value === projectColor
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
			</PopoverContent>
		</Popover>
	);
}
