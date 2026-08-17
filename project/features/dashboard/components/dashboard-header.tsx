"use client";

import { Plus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFullDate } from "@/lib/date-formatter";

type DashboardHeaderProps = {
	workspaceName: string;
	canInvite: boolean;
	onInvite: () => void;
	onCreateTask: () => void;
	onCreateProject: () => void;
};

export function DashboardHeader({
	workspaceName,
	canInvite,
	onInvite,
	onCreateTask,
	onCreateProject,
}: DashboardHeaderProps) {
	const [today, setToday] = useState<Date | null>(null);

	useEffect(() => {
		setToday(new Date());
	}, []);

	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Dashboard</h1>

				<div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
					<span className="truncate">{workspaceName}</span>

					<span aria-hidden="true">•</span>

					{today ? (
						<time dateTime={today.toISOString()} className="shrink-0">
							{formatFullDate(today)}
						</time>
					) : (
						<Skeleton className="h-4 w-44 shrink-0" />
					)}
				</div>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				{canInvite && (
					<Button
						type="button"
						variant="outline"
						size="lg"
						onClick={onInvite}
						className="w-full sm:w-auto"
					>
						<UserPlus className="size-4" />
						Invite Member
					</Button>
				)}

				<Button
					type="button"
					variant="outline"
					size="lg"
					onClick={onCreateTask}
					className="w-full sm:w-auto"
				>
					<Plus className="size-4" />
					New Task
				</Button>

				<Button
					type="button"
					size="lg"
					onClick={onCreateProject}
					className="w-full sm:w-auto"
				>
					<Plus className="size-4" />
					New Project
				</Button>
			</div>
		</div>
	);
}
