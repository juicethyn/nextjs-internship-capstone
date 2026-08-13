import { ToolbarSkeleton } from "@/components/shared/toolbar-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { MembersGridSkeleton } from "@/features/members/components/members-grid-skeleton";
import { MembersHeaderSkeleton } from "@/features/members/components/members-header-skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<MembersHeaderSkeleton />

			{/* Same search + two dropdowns as the projects toolbar */}
			<ToolbarSkeleton />

			{/* "Members N" count line */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-3 w-24" />
			</div>

			<MembersGridSkeleton />
		</div>
	);
}
