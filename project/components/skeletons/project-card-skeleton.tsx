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
				p-4
				sm:p-5
			"
		>
			{/* Header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<Skeleton className="size-7 rounded-lg sm:size-8" />

					<Skeleton className="h-4 w-32" />
				</div>

				<Skeleton className="h-5 w-18 shrink-0 rounded-full" />
			</div>

			{/* Description + labels */}
			<div className="space-y-2.5">
				<div className="flex h-10 flex-col gap-1.5">
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-4/5" />
				</div>

				<div className="flex min-h-7 items-center gap-1.5">
					<Skeleton className="h-6 w-20 rounded-full" />
					<Skeleton className="h-6 w-16 rounded-full" />
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
