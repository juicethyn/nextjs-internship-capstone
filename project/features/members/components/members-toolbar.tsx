"use client";

import { ChevronDown, ListFilter, Search, UserCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	MEMBER_ROLE_FILTER_OPTIONS,
	MEMBER_STATUS_FILTER_OPTIONS,
	WORKSPACE_ROLE_STYLES,
	type WorkspaceMemberRoleFilter,
	type WorkspaceMemberStatusFilter,
} from "@/features/members/lib/member-filters";
import { cn } from "@/lib/utils";

type MembersToolbarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	role: WorkspaceMemberRoleFilter;
	onRoleChange: (value: WorkspaceMemberRoleFilter) => void;
	status: WorkspaceMemberStatusFilter;
	onStatusChange: (value: WorkspaceMemberStatusFilter) => void;
};

export function MembersToolbar({
	search,
	onSearchChange,
	role,
	onRoleChange,
	status,
	onStatusChange,
}: MembersToolbarProps) {
	const roleLabel =
		role === "all"
			? "Role"
			: (MEMBER_ROLE_FILTER_OPTIONS.find((option) => option.value === role)
					?.label ?? "Role");

	const statusLabel =
		status === "all"
			? "Status"
			: (MEMBER_STATUS_FILTER_OPTIONS.find((option) => option.value === status)
					?.label ?? "Status");

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div className="relative flex-1">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search members..."
					aria-label="Search members by name or email"
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
							aria-label={`Filter by role: ${roleLabel}`}
							className="w-full justify-between sm:w-36"
						>
							<span className="flex min-w-0 items-center gap-1.5">
								{role === "all" ? (
									<UserCog className="text-muted-foreground" />
								) : (
									<span
										className={cn(
											"size-2 shrink-0 rounded-full",
											WORKSPACE_ROLE_STYLES[role].dot,
										)}
									/>
								)}

								<span className="truncate">{roleLabel}</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="start" className="w-40">
						<DropdownMenuLabel>Role</DropdownMenuLabel>

						<DropdownMenuRadioGroup
							value={role}
							onValueChange={(value) =>
								onRoleChange(value as WorkspaceMemberRoleFilter)
							}
						>
							{MEMBER_ROLE_FILTER_OPTIONS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.value === "all" ? (
										<UserCog className="text-muted-foreground" />
									) : (
										<span
											className={cn(
												"size-2 shrink-0 rounded-full",
												WORKSPACE_ROLE_STYLES[option.value].dot,
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
											status === "online"
												? "bg-emerald-500"
												: "bg-muted-foreground/50",
										)}
									/>
								)}

								<span className="truncate">{statusLabel}</span>
							</span>

							<ChevronDown className="text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuLabel>Status</DropdownMenuLabel>

						<DropdownMenuRadioGroup
							value={status}
							onValueChange={(value) =>
								onStatusChange(value as WorkspaceMemberStatusFilter)
							}
						>
							{MEMBER_STATUS_FILTER_OPTIONS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.value === "all" ? (
										<ListFilter className="text-muted-foreground" />
									) : (
										<span
											className={cn(
												"size-2 shrink-0 rounded-full",
												option.value === "online"
													? "bg-emerald-500"
													: "bg-muted-foreground/50",
											)}
										/>
									)}

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
