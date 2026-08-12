import { Skeleton } from "@/components/ui/skeleton";

export function ProjectToolbarSkeleton() {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
			{/* Search input */}
			<Skeleton className="h-9 flex-1 rounded-md" />

			{/* Status + sort triggers — same two-up grid as the real toolbar */}
			<div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
				<Skeleton className="h-9 w-full rounded-md sm:w-36" />
				<Skeleton className="h-9 w-full rounded-md sm:w-44" />
			</div>
		</div>
	);
}
