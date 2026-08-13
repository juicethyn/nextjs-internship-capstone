import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type MembersEmptyStateProps = {
	onClearFilters: () => void;
};

export function MembersEmptyState({ onClearFilters }: MembersEmptyStateProps) {
	return (
		<div className="flex flex-col items-center rounded-xl px-6 py-12 text-center">
			<div className="flex size-10 items-center justify-center rounded-full bg-muted">
				<SearchX className="size-5 text-muted-foreground" />
			</div>

			<h2 className="mt-4 text-sm font-semibold">
				No members match your filters
			</h2>

			<p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
				Try a different search term, or reset the filters to see everyone in
				this workspace.
			</p>

			<Button
				variant="outline"
				size="sm"
				className="mt-4"
				onClick={onClearFilters}
			>
				Clear filters
			</Button>
		</div>
	);
}
