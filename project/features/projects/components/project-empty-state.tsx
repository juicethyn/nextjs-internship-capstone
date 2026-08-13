import { FolderPlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProjectsEmptyStateProps =
	| { variant: "no-projects"; onCreateProject: () => void }
	| { variant: "no-results"; onClearFilters: () => void };

export function ProjectsEmptyState(props: ProjectsEmptyStateProps) {
	const isNoResults = props.variant === "no-results";
	const Icon = isNoResults ? SearchX : FolderPlus;

	return (
		<div className="flex flex-col items-center rounded-xl px-6 py-12 text-center">
			<div className="flex size-10 items-center justify-center rounded-full bg-muted">
				<Icon className="size-5 text-muted-foreground" />
			</div>

			<h2 className="mt-4 text-sm font-semibold">
				{isNoResults ? "No projects match your filters" : "No projects yet"}
			</h2>

			<p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
				{isNoResults
					? "Try a different search term, or reset the filters to see everything in this workspace."
					: "Create your first project to start organizing work in this workspace."}
			</p>

			{isNoResults ? (
				<Button
					variant="outline"
					size="sm"
					className="mt-4"
					onClick={props.onClearFilters}
				>
					Clear filters
				</Button>
			) : (
				<Button size="sm" className="mt-4" onClick={props.onCreateProject}>
					<FolderPlus />
					New Project
				</Button>
			)}
		</div>
	);
}
