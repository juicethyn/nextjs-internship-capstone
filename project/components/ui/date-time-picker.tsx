"use client";

import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { combineDateAndTime } from "@/lib/date-formatter";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
	value?: Date | null;
	onChange: (value: Date | null) => void;
	disableTime?: boolean;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	className?: string;
};

function toTimeValue(date: Date | null | undefined) {
	if (!date) return "09:00";

	return `${String(date.getHours()).padStart(2, "0")}:${String(
		date.getMinutes(),
	).padStart(2, "0")}`;
}

function formatTrigger(date: Date, withTime: boolean) {
	const day = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	if (!withTime) return day;

	const time = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});

	return `${day} ${time}`;
}

export function DateTimePicker({
	value,
	onChange,
	disableTime = false,
	placeholder = "Pick a date",
	disabled = false,
	id,
	className,
}: DateTimePickerProps) {
	const [open, setOpen] = useState(false);

	const selected = value ?? undefined;

	const time = toTimeValue(value);

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
							{selected ? formatTrigger(selected, !disableTime) : placeholder}
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={(date) => {
							if (!date) return onChange(null);

							onChange(combineDateAndTime(date, disableTime ? "00:00" : time));
						}}
						defaultMonth={selected}
						autoFocus
					/>

					<div className="flex items-center gap-2 border-t p-3">
						<Label
							htmlFor={id ? `${id}-time` : undefined}
							className="text-xs text-muted-foreground"
						>
							Time
						</Label>

						<Input
							id={id ? `${id}-time` : undefined}
							type="time"
							value={time}
							disabled={disableTime || !selected}
							onChange={(e) => {
								if (!selected) return;

								onChange(combineDateAndTime(selected, e.target.value));
							}}
							className="h-8 w-auto flex-1"
						/>
					</div>
				</PopoverContent>
			</Popover>

			{selected && !disabled && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Clear date"
					onClick={() => onChange(null)}
				>
					<X />
				</Button>
			)}
		</div>
	);
}
