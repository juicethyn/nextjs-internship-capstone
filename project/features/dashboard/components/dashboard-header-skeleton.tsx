import { Skeleton } from "@/components/ui/skeleton";

export function DashboardHeaderSkeleton() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				{/* "Dashboard" — text-2xl lg:text-3xl */}
				<Skeleton className="h-8 w-40 lg:h-9" />

				{/* Workspace name • today's date */}
				<Skeleton className="h-4 w-64" />
			</div>

			{/* Three size="lg" buttons */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Skeleton className="h-9 w-full rounded-md sm:w-36" />
				<Skeleton className="h-9 w-full rounded-md sm:w-28" />
				<Skeleton className="h-9 w-full rounded-md sm:w-32" />
			</div>
		</div>
	);
}
