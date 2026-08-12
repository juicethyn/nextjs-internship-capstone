import { ProjectGridSkeleton } from "@/components/skeletons/project-grid-skeleton";
import { ProjectHeaderSkeleton } from "@/components/skeletons/project-header-skeleton";
import { ProjectToolbarSkeleton } from "@/components/skeletons/project-toolbar-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Next renders this automatically while the page awaits its data — no
// <Suspense> wiring needed, and none is possible from inside ProjectClient
// because that component receives an already-resolved array.
export default function Loading() {
	return (
		<div className="space-y-6">
			<ProjectHeaderSkeleton />

			<ProjectToolbarSkeleton />

			{/* "Projects N" count line */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-3 w-24" />
			</div>

			<ProjectGridSkeleton />
		</div>
	);
}
