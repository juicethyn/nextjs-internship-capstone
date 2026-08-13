import { ProjectCardSkeleton } from "./project-card-skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"];

export function ProjectGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{PLACEHOLDERS.map((id) => (
				<ProjectCardSkeleton key={id} />
			))}
		</div>
	);
}
