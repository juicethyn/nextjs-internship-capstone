import type { ProjectDetail } from "@/features/projects/types";

type BoardList = ProjectDetail["lists"][number];
type BoardTask = BoardList["tasks"][number];

const byPosition = (a: { position: number }, b: { position: number }) =>
	a.position - b.position;

export function applyListMove(
	project: ProjectDetail,
	listId: string,
	position: number,
): ProjectDetail {
	const lists = project.lists
		.map((list) => (list.id === listId ? { ...list, position } : list))
		.sort(byPosition);

	return { ...project, lists };
}

export function applyTaskMove(
	project: ProjectDetail,
	taskId: string,
	destinationListId: string,
	position: number,
): ProjectDetail {
	let moved: BoardTask | undefined;

	for (const list of project.lists) {
		const found = list.tasks.find((task) => task.id === taskId);

		if (found) {
			moved = found;
			break;
		}
	}

	if (!moved) {
		return project;
	}

	const movedTask: BoardTask = {
		...moved,
		listId: destinationListId,
		position,
	};

	const lists = project.lists.map((list) => {
		const withoutTask = list.tasks.filter((task) => task.id !== taskId);

		if (list.id !== destinationListId) {
			return withoutTask.length === list.tasks.length
				? list
				: { ...list, tasks: withoutTask };
		}

		return {
			...list,
			tasks: [...withoutTask, movedTask].sort(byPosition),
		};
	});

	return { ...project, lists };
}

type TaskLabelEntry = BoardTask["taskLabels"][number];
type TaskLabel = TaskLabelEntry["taskLabel"];

export function applyTaskLabels(
	project: ProjectDetail,
	taskId: string,
	labels: TaskLabel[],
): ProjectDetail {
	const lists = project.lists.map((list) => {
		if (!list.tasks.some((task) => task.id === taskId)) {
			return list;
		}

		return {
			...list,
			tasks: list.tasks.map((task) =>
				task.id === taskId
					? {
							...task,
							taskLabels: labels.map((label) => ({
								id: `optimistic-${taskId}-${label.id}`,
								taskId,
								taskLabelId: label.id,
								createdAt: new Date(),
								taskLabel: label,
							})),
						}
					: task,
			),
		};
	});

	return { ...project, lists };
}

export function findListIdByTaskId(project: ProjectDetail, taskId: string) {
	return project.lists.find((list) =>
		list.tasks.some((task) => task.id === taskId),
	)?.id;
}

export function getNeighbourPositions(
	ordered: { id: string; position: number }[],
	targetIndex: number,
) {
	return {
		prev: targetIndex > 0 ? ordered[targetIndex - 1].position : undefined,
		next:
			targetIndex < ordered.length - 1
				? ordered[targetIndex + 1].position
				: undefined,
	};
}
