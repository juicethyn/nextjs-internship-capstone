import { ProjectCardSkeleton } from "./project-card-skeleton";

export function ProjectGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_) => (
				<ProjectCardSkeleton key={crypto.randomUUID()} />
			))}
		</div>
	);
}
