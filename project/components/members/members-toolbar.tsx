"use client";

import { ChevronDown, ListFilter, Search, UserCog } from "lucide-react";
import {
	MEMBER_ROLE_FILTER_OPTIONS,
	MEMBER_STATUS_FILTER_OPTIONS,
} from "@/lib/utils/workspace-members";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export function MembersToolbar() {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

				<Input
					placeholder="Search members..."
					aria-label="Search members by name or email"
					className="pl-9"
				/>
			</div>

			<div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							aria-label="Filter by role"
							className="w-full justify-between sm:w-36"
						>
							<span className="flex min-w-0 items-center gap-1.5">
								<UserCog className="text-muted-foreground" />

								<span className="truncate">Role</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="start" className="w-40">
						<DropdownMenuLabel>Role</DropdownMenuLabel>

						{MEMBER_ROLE_FILTER_OPTIONS.map((option) => (
							<DropdownMenuItem key={option.value}>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							aria-label="Filter by status"
							className="w-full justify-between sm:w-36"
						>
							<span className="flex min-w-0 items-center gap-1.5">
								<ListFilter className="text-muted-foreground" />

								<span className="truncate">Status</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuLabel>Status</DropdownMenuLabel>

						{MEMBER_STATUS_FILTER_OPTIONS.map((option) => (
							<DropdownMenuItem key={option.value}>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
