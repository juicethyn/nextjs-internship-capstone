"use client";

import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatProjectDate } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";

type DatePickerProps = {
	value?: Date | null;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	className?: string;
};

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	id,
	className,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);

	const selected = value ?? undefined;

	return (
		<div className={cn("flex items-center gap-1", className)}>
			<Popover modal open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						id={id}
						variant="outline"
						disabled={disabled}
						className="min-w-0 flex-1 justify-start gap-2 font-normal"
					>
						<CalendarIcon className="size-4 shrink-0" />

						<span
							className={cn("truncate", !selected && "text-muted-foreground")}
						>
							{selected ? formatProjectDate(selected) : placeholder}
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={(date) => {
							onChange(date);
							setOpen(false);
						}}
						defaultMonth={selected}
						autoFocus
					/>
				</PopoverContent>
			</Popover>

			{selected && !disabled && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Clear date"
					onClick={() => onChange(undefined)}
				>
					<X />
				</Button>
			)}
		</div>
	);
}
