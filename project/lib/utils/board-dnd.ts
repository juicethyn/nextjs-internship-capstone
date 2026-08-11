import type { ProjectDetail } from "@/types/projects";

type BoardList = ProjectDetail["lists"][number];
type BoardTask = BoardList["tasks"][number];

const byPosition = (a: { position: number }, b: { position: number }) =>
	a.position - b.position;

// Optimistic counterpart to moveListAction: rewrite the cached project so the
// board keeps the dropped order while the mutation is in flight.
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

// Optimistic counterpart to moveTaskAction. Handles the cross-list case by
// removing the task from every list and re-inserting it into the destination.
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

export function findListIdByTaskId(project: ProjectDetail, taskId: string) {
	return project.lists.find((list) =>
		list.tasks.some((task) => task.id === taskId),
	)?.id;
}

// Neighbours of the slot an item was dropped into, given the ordered ids after
// the drop. Feeds calculatePosition.
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
