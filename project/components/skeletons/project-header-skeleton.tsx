import { Skeleton } from "@/components/ui/skeleton";

export function ProjectHeaderSkeleton() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="space-y-1">
				{/* "Browse Projects" — text-2xl lg:text-3xl */}
				<Skeleton className="h-8 w-56 lg:h-9" />

				{/* "N active • N archived" */}
				<Skeleton className="h-4 w-40" />
			</div>

			{/* size="lg" button */}
			<Skeleton className="h-10 w-full rounded-md sm:w-36" />
		</div>
	);
}
