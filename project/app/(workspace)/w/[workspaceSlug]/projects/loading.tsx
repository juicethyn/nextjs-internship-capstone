import { ToolbarSkeleton } from "@/components/shared/toolbar-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectGridSkeleton } from "@/features/projects/components/project-grid-skeleton";
import { ProjectHeaderSkeleton } from "@/features/projects/components/project-header-skeleton";

// Next renders this automatically while the page awaits its data — no
// <Suspense> wiring needed, and none is possible from inside ProjectClient
// because that component receives an already-resolved array.
export default function Loading() {
	return (
		<div className="space-y-6">
			<ProjectHeaderSkeleton />

			<ToolbarSkeleton />

			{/* "Projects N" count line */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-3 w-24" />
			</div>

			<ProjectGridSkeleton />
		</div>
	);
}
