"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MyTaskItemData } from "@/features/dashboard/hooks/use-my-tasks";
import { useMyTasks } from "@/features/dashboard/hooks/use-my-tasks";
import { MyTaskItem } from "./my-task-item";
import { MyTasksSkeleton } from "./my-tasks-skeleton";

type MyTasksProps = {
	workspaceSlug: string;
};

type TabDefinition = {
	value: string;
	label: string;
	tasks: MyTaskItemData[];
	empty: string;
};

function TaskList({
	tasks,
	empty,
	workspaceSlug,
}: {
	tasks: MyTaskItemData[];
	empty: string;
	workspaceSlug: string;
}) {
	if (tasks.length === 0) {
		return <p className="py-6 text-sm text-muted-foreground">{empty}</p>;
	}

	return (
		<ul className="max-h-80 overflow-y-auto">
			{tasks.map((task) => (
				<MyTaskItem key={task.id} task={task} workspaceSlug={workspaceSlug} />
			))}
		</ul>
	);
}

export function MyTasks({ workspaceSlug }: MyTasksProps) {
	const { data, isLoading, isError } = useMyTasks({ workspaceSlug });

	if (isLoading) {
		return <MyTasksSkeleton />;
	}

	if (isError || !data) {
		return (
			<Card>
				<CardHeader className="border-b pb-3">
					<CardTitle>My Tasks</CardTitle>
				</CardHeader>

				<CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
					<TriangleAlert className="size-4 shrink-0" />
					<span>Couldn't load your tasks.</span>
				</CardContent>
			</Card>
		);
	}

	const tabs: TabDefinition[] = [
		{
			value: "overdue",
			label: "Overdue",
			tasks: data.overdue,
			empty: "Nothing overdue. Nice.",
		},
		{
			value: "due-today",
			label: "Due Today",
			tasks: data.dueToday,
			empty: "Nothing due today.",
		},
		{
			value: "upcoming",
			label: "Upcoming",
			tasks: data.upcoming,
			empty: "Nothing upcoming.",
		},
	];

	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<CardTitle>My Tasks</CardTitle>
			</CardHeader>

			<CardContent>
				<Tabs defaultValue="due-today">
					<TabsList className="w-full sm:w-fit">
						{tabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
								<span className="ml-1.5 tabular-nums text-muted-foreground">
									{tab.tasks.length}
								</span>
							</TabsTrigger>
						))}
					</TabsList>

					{tabs.map((tab) => (
						<TabsContent key={tab.value} value={tab.value}>
							<TaskList
								tasks={tab.tasks}
								empty={tab.empty}
								workspaceSlug={workspaceSlug}
							/>
						</TabsContent>
					))}
				</Tabs>
			</CardContent>
		</Card>
	);
}
