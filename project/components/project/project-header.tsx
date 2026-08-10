import { Plus } from "lucide-react";
import { Button } from "../ui/button";

type ProjectHeaderProps = {
	onCreateProject: () => void;
	activeCount: number;
	archivedCount: number;
};

export function ProjectsHeader({
	onCreateProject,
	activeCount,
	archivedCount,
}: ProjectHeaderProps) {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Browse Projects</h1>

				<p className="text-sm text-muted-foreground">
					{activeCount} active • {archivedCount} archived
				</p>
			</div>

			<Button size="lg" className="w-full sm:w-auto" onClick={onCreateProject}>
				<Plus className="size-4" />
				New Project
			</Button>
		</div>
	);
}
