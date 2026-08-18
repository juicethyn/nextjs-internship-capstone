import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsHeaderSkeleton() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				<Skeleton className="h-8 w-36 lg:h-9" />
				<Skeleton className="h-4 w-56" />
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Skeleton className="h-9 w-full rounded-md sm:w-32" />
				<Skeleton className="h-9 w-full rounded-md sm:w-32" />
				<Skeleton className="h-9 w-full rounded-md sm:w-40" />
			</div>
		</div>
	);
}
