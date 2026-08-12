import { Skeleton } from "@/components/ui/skeleton";

export function KanbanHeaderSkeleton() {
	return (
		<div className="w-full min-w-0 space-y-3 border-b py-4">
			{/* "Back to Projects" */}
			<Skeleton className="h-3.5 w-32" />

			<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Project avatar + name + status badge */}
				<div className="flex min-w-0 items-center gap-2.5 px-2 py-1">
					<Skeleton className="size-8 rounded-lg" />
					<Skeleton className="h-5 w-40 sm:h-6" />
					<Skeleton className="h-5 w-16 shrink-0 rounded-full" />
				</div>

				<div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
					{/* Overlapping member avatars */}
					<div className="flex -space-x-2">
						<Skeleton className="size-7 rounded-full ring-2 ring-background" />
						<Skeleton className="size-7 rounded-full ring-2 ring-background" />
						<Skeleton className="size-7 rounded-full ring-2 ring-background" />
					</div>

					{/* Invite / Sort / Settings */}
					<div className="flex shrink-0 items-center gap-2">
						<Skeleton className="h-8 w-9 rounded-md sm:w-20" />
						<Skeleton className="h-8 w-9 rounded-md sm:w-18" />
						<Skeleton className="h-8 w-9 rounded-md sm:w-24" />
					</div>
				</div>
			</div>
		</div>
	);
}
