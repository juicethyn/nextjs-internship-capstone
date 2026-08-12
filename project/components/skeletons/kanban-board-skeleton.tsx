import { ListCardSkeleton } from "./list-card-skeleton";

const COLUMNS = [
	{ id: "todo", cards: 3 },
	{ id: "in-progress", cards: 2 },
	{ id: "done", cards: 1 },
];

export function KanbanBoardSkeleton() {
	return (
		<div className="board-scrollbar flex h-full items-start gap-4 overflow-x-auto overflow-y-hidden pb-4">
			{COLUMNS.map((column) => (
				<ListCardSkeleton key={column.id} cards={column.cards} />
			))}
		</div>
	);
}
