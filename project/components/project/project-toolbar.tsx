"use client";

import { ArrowUpDown, ChevronDown, ListFilter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	PROJECT_SORT_OPTIONS,
	PROJECT_STATUS_FILTER_OPTIONS,
	type ProjectSortKey,
	type ProjectStatusFilter,
} from "@/lib/utils/project-filters";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { PROJECT_STATUS_STYLES } from "./project-status-badge";

type ProjectsToolbarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	status: ProjectStatusFilter;
	onStatusChange: (value: ProjectStatusFilter) => void;
	sort: ProjectSortKey;
	onSortChange: (value: ProjectSortKey) => void;
};

export function ProjectsToolbar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	sort,
	onSortChange,
}: ProjectsToolbarProps) {
	const statusLabel =
		status === "all"
			? "Status"
			: (PROJECT_STATUS_FILTER_OPTIONS.find((option) => option.value === status)
					?.label ?? "Status");

	const sortLabel =
		PROJECT_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "";

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search projects..."
					aria-label="Search projects by name"
					className={search ? "pr-9 pl-9" : "pl-9"}
				/>

				{search && (
					<div className="absolute top-1/2 right-1.5 -translate-y-1/2">
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							onClick={() => onSearchChange("")}
							aria-label="Clear search"
							className="text-muted-foreground"
						>
							<X />
						</Button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							aria-label={`Filter by status: ${statusLabel}`}
							className="w-full justify-between sm:w-36"
						>
							<span className="flex min-w-0 items-center gap-1.5">
								{status === "all" ? (
									<ListFilter className="text-muted-foreground" />
								) : (
									<span
										className={cn(
											"size-2 shrink-0 rounded-full",
											PROJECT_STATUS_STYLES[status].dot,
										)}
									/>
								)}

								<span className="truncate">{statusLabel}</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="start" className="w-40">
						<DropdownMenuLabel>Status</DropdownMenuLabel>

						<DropdownMenuRadioGroup
							value={status}
							onValueChange={(value) =>
								onStatusChange(value as ProjectStatusFilter)
							}
						>
							{PROJECT_STATUS_FILTER_OPTIONS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.value === "all" ? (
										<ListFilter className="text-muted-foreground" />
									) : (
										<span
											className={cn(
												"size-2 shrink-0 rounded-full",
												PROJECT_STATUS_STYLES[option.value].dot,
											)}
										/>
									)}

									{option.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							aria-label={`Sort by ${sortLabel}`}
							className="w-full justify-between sm:w-44"
						>
							<span className="flex min-w-0 items-center gap-1.5">
								<ArrowUpDown className="text-muted-foreground" />

								<span className="truncate">Sort: {sortLabel}</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-44">
						<DropdownMenuLabel>Sort by</DropdownMenuLabel>

						<DropdownMenuRadioGroup
							value={sort}
							onValueChange={(value) => onSortChange(value as ProjectSortKey)}
						>
							{PROJECT_SORT_OPTIONS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
