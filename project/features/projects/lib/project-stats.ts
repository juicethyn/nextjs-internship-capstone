import type { getProjectsByWorkspace } from "@/lib/db/queries/projects";

type ProjectLists = Awaited<
	ReturnType<typeof getProjectsByWorkspace>
>[number]["lists"];

export function getProjectTaskStats(lists: ProjectLists) {
	const allTasks = lists.flatMap((list) => list.tasks);

	const completedTasks = lists
		.filter((list) => list.type === "done")
		.flatMap((list) => list.tasks);

	const totalTasks = allTasks.length;
	const completedCount = completedTasks.length;

	const progress =
		totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

	return {
		totalTasks,
		completedTasks: completedCount,
		progress,
	};
}
