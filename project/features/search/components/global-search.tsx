"use client";

import { CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { SEARCH_DEBOUNCE_MS } from "@/features/search/constants";
import { useGlobalSearch } from "@/features/search/hooks/use-global-search";
import {
	membersHref,
	projectHref,
	taskHref,
} from "@/features/search/lib/search-href";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type GlobalSearchProps = {
	workspaceSlug: string;
};

export function GlobalSearch({ workspaceSlug }: GlobalSearchProps) {
	const router = useRouter();

	const containerRef = useRef<HTMLDivElement>(null);

	const [isOpen, setOpen] = useState(false);
	const [term, setTerm] = useState("");

	const debouncedTerm = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS);

	const { results, total, isSearchable, isLoading } = useGlobalSearch(
		workspaceSlug,
		debouncedTerm,
	);

	const getInput = useCallback(
		() =>
			containerRef.current?.querySelector<HTMLInputElement>(
				"[data-slot=command-input]",
			),
		[],
	);

	useEffect(() => {
		const handlePointerDown = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);

		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, []);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen(true);
				getInput()?.focus();
				return;
			}

			if (event.key === "Escape") {
				setOpen(false);
				getInput()?.blur();
			}
		};

		window.addEventListener("keydown", handleShortcut);

		return () => window.removeEventListener("keydown", handleShortcut);
	}, [getInput]);

	const goTo = (href: string) => {
		setOpen(false);
		setTerm("");
		getInput()?.blur();
		router.push(href);
	};

	return (
		<div ref={containerRef} className="relative w-full max-w-md">
			<Command
				shouldFilter={false}
				className="h-auto overflow-visible bg-transparent p-0"
			>
				<div className="relative">
					<CommandInput
						value={term}
						onValueChange={setTerm}
						onFocus={() => setOpen(true)}
						placeholder="Search projects, tasks, people..."
						className="pr-12"
					/>

					<kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
						⌘K
					</kbd>
				</div>

				{isOpen && (
					<div className="absolute inset-x-0 top-full z-50 mt-2 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
						<CommandList>
							{!isSearchable ? (
								<div className="px-3 py-6 text-center text-sm text-muted-foreground">
									Type at least 2 characters to search.
								</div>
							) : isLoading ? (
								<div className="px-3 py-6 text-center text-sm text-muted-foreground">
									Searching...
								</div>
							) : (
								<>
									{total === 0 && (
										<CommandEmpty>No results found.</CommandEmpty>
									)}

									{results.projects.length > 0 && (
										<CommandGroup heading="Projects">
											{results.projects.map((project) => (
												<CommandItem
													key={project.id}
													value={`project-${project.id}`}
													onSelect={() =>
														goTo(projectHref(workspaceSlug, project))
													}
												>
													<span
														className="size-3 shrink-0 rounded-sm"
														style={{ backgroundColor: project.color }}
													/>

													<span className="truncate">{project.name}</span>
												</CommandItem>
											))}
										</CommandGroup>
									)}

									{results.tasks.length > 0 && (
										<CommandGroup heading="Tasks">
											{results.tasks.map((task) => (
												<CommandItem
													key={task.id}
													value={`task-${task.id}`}
													onSelect={() => goTo(taskHref(workspaceSlug, task))}
												>
													<CheckSquare className="size-4 shrink-0 text-muted-foreground" />

													<span className="truncate">{task.title}</span>

													{task.completedAt && (
														<Badge variant="muted" className="shrink-0">
															Done
														</Badge>
													)}

													<span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
														{task.projectName}
													</span>
												</CommandItem>
											))}
										</CommandGroup>
									)}

									{results.members.length > 0 && (
										<CommandGroup heading="Members">
											{results.members.map((member) => (
												<CommandItem
													key={member.id}
													value={`member-${member.id}`}
													onSelect={() => goTo(membersHref(workspaceSlug))}
												>
													<Avatar className="size-5">
														{member.imageUrl && (
															<AvatarImage
																src={member.imageUrl}
																alt={memberDisplayName(member)}
															/>
														)}

														<AvatarFallback className="text-[9px]">
															{getInitials(member.firstName, member.lastName)}
														</AvatarFallback>
													</Avatar>

													<span className="truncate">
														{memberDisplayName(member)}
													</span>

													<span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
														{member.email}
													</span>
												</CommandItem>
											))}
										</CommandGroup>
									)}
								</>
							)}
						</CommandList>
					</div>
				)}
			</Command>
		</div>
	);
}
