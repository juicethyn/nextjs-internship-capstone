import { Skeleton } from "@/components/ui/skeleton";

export function MembersHeaderSkeleton() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				{/* "Team Members" — text-2xl lg:text-3xl */}
				<Skeleton className="h-8 w-52 lg:h-9" />

				{/* Page description */}
				<Skeleton className="h-4 w-72" />
			</div>

			{/* size="lg" button */}
			<Skeleton className="h-10 w-full rounded-md sm:w-36" />
		</div>
	);
}
