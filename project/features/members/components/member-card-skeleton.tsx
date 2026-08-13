import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
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
			{/* Identity + role */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-center gap-2.5">
					<Skeleton className="size-10 shrink-0 rounded-full" />

					<div className="space-y-1.5">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-20" />
					</div>
				</div>

				<Skeleton className="h-5 w-16 shrink-0 rounded-full" />
			</div>

			{/* Email + presence */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-1.5">
					<Skeleton className="size-3.5 shrink-0 rounded-full" />
					<Skeleton className="h-3 w-36" />
				</div>

				<Skeleton className="h-3 w-14 shrink-0" />
			</div>

			{/* Footer */}
			<div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
				<div className="flex items-center gap-1">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-3 w-16" />
				</div>

				<Skeleton className="h-3 w-24" />
			</div>
		</div>
	);
}
