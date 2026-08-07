"use client";

import { format, parse } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const VALUE_FORMAT = "yyyy-MM-dd";

type ProjectDatePickerProps = {
	startDate?: string;
	dueDate?: string;
	onChange: (range: { startDate?: string; dueDate?: string }) => void;
};

function toDate(value?: string) {
	if (!value) return undefined;

	const parsed = parse(value, VALUE_FORMAT, new Date());

	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toValue(date?: Date) {
	return date ? format(date, VALUE_FORMAT) : undefined;
}

export function ProjectDatePicker({
	startDate,
	dueDate,
	onChange,
}: ProjectDatePickerProps) {
	const [open, setOpen] = useState(false);

	const from = toDate(startDate);
	const to = toDate(dueDate);

	const selected: DateRange | undefined = from ? { from, to } : undefined;

	const handleSelect = (range: DateRange | undefined) => {
		onChange({
			startDate: toValue(range?.from),
			dueDate: toValue(range?.to),
		});
	};

	const displayLabel = () => {
		if (from && to) {
			return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
		}

		if (from) {
			return `${format(from, "MMM d, yyyy")} – Select end date`;
		}

		return "Pick a date range";
	};

	return (
		<div className="flex items-center gap-2">
			<Popover modal open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						className="min-w-0 flex-1 justify-start gap-2 font-normal"
					>
						<CalendarIcon className="size-4 shrink-0" />

						<span
							className={from ? "truncate" : "truncate text-muted-foreground"}
						>
							{displayLabel()}
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="range"
						selected={selected}
						onSelect={handleSelect}
						defaultMonth={from}
						numberOfMonths={1}
						autoFocus
					/>
				</PopoverContent>
			</Popover>

			{from && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label="Clear dates"
					onClick={() => onChange({ startDate: undefined, dueDate: undefined })}
				>
					<X className="size-4" />
				</Button>
			)}
		</div>
	);
}
