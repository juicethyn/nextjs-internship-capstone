import { MembersGridSkeleton } from "@/components/skeletons/members-grid-skeleton";
import { MembersHeaderSkeleton } from "@/components/skeletons/members-header-skeleton";
import { ProjectToolbarSkeleton } from "@/components/skeletons/project-toolbar-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<MembersHeaderSkeleton />

			{/* Same search + two dropdowns as the projects toolbar */}
			<ProjectToolbarSkeleton />

			{/* "Members N" count line */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-3 w-24" />
			</div>

			<MembersGridSkeleton />
		</div>
	);
}
