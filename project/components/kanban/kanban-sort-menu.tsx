"use client";

import { ArrowUpDown } from "lucide-react";
import {
	DEFAULT_TASK_SORT,
	TASK_SORT_OPTIONS,
	type TaskSortKey,
} from "@/lib/utils/task-sort";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function KanbanSortMenu() {
	const taskSort = useUIStore((state) => state.taskSort);
	const setTaskSort = useUIStore((state) => state.setTaskSort);

	const isSorted = taskSort !== DEFAULT_TASK_SORT;

	const sortLabel =
		TASK_SORT_OPTIONS.find((option) => option.value === taskSort)?.label ?? "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					aria-label={`Sort cards by ${sortLabel}`}
					className="relative"
				>
					<ArrowUpDown className="size-4" />
					<span className="hidden sm:inline">Sort</span>

					{/* The board looks reordered but nothing was saved — say so. */}
					{isSorted && (
						<span
							aria-hidden
							className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-background"
						/>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel>Sort cards by</DropdownMenuLabel>

				<DropdownMenuRadioGroup
					value={taskSort}
					onValueChange={(value) => setTaskSort(value as TaskSortKey)}
				>
					{TASK_SORT_OPTIONS.map((option) => (
						<DropdownMenuRadioItem key={option.value} value={option.value}>
							{option.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
