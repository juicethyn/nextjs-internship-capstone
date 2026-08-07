import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
	return (
		<div
			className="
				flex
				flex-col
				gap-4
				rounded-xl
				border
				bg-card
				p-5
			"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-1">
					<Skeleton className="h-4 w-14 rounded-full" />
					<Skeleton className="h-4 w-16 rounded-full" />
				</div>

				<Skeleton className="h-5 w-18 rounded-full" />
			</div>

			{/* Project */}
			<div>
				<div className="mb-1.5 flex items-center gap-2.5">
					<Skeleton className="size-8 rounded-full" />

					<Skeleton className="h-4 w-32" />
				</div>

				<div className="space-y-1">
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-4/5" />
				</div>
			</div>

			{/* Progress */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between">
					<Skeleton className="h-3 w-14" />
					<Skeleton className="h-3 w-8" />
				</div>

				<Skeleton className="h-1.5 w-full rounded-full" />
			</div>

			{/* Footer */}
			<div
				className="
					mt-auto
					flex
					items-center
					gap-3
					border-t
					pt-3
				"
			>
				<div className="flex items-center gap-1">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-5" />
				</div>

				<div className="flex items-center gap-1">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-14" />
				</div>

				<div className="ml-auto flex items-center gap-1">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
		</div>
	);
}
