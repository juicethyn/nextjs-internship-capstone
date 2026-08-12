import { Skeleton } from "@/components/ui/skeleton";

type ListCardSkeletonProps = {
	cards?: number;
};

const CARD_IDS = ["a", "b", "c", "d"];

export function ListCardSkeleton({ cards = 3 }: ListCardSkeletonProps) {
	return (
		// Same w-full / sm:w-72 as the real column so nothing shifts on swap.
		<div className="flex w-full shrink-0 flex-col rounded-xl border bg-card sm:w-72">
			<div className="flex shrink-0 items-center gap-2 border-b p-3">
				<Skeleton className="size-4 shrink-0" />
				<Skeleton className="size-2 shrink-0 rounded-full" />
				<Skeleton className="h-4 flex-1" />
				<Skeleton className="h-5 w-6 shrink-0 rounded-full" />
			</div>

			<div className="space-y-2 p-3">
				{CARD_IDS.slice(0, cards).map((id) => (
					<div
						key={id}
						className="space-y-2 rounded-lg border border-border bg-card p-3"
					>
						<div className="flex items-start gap-2">
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="size-6 shrink-0 rounded-full" />
						</div>

						<div className="flex items-center gap-1.5">
							<Skeleton className="h-5 w-16 rounded-full" />
							<Skeleton className="h-5 w-12 rounded-full" />
						</div>

						<div className="flex items-center justify-between gap-3">
							<Skeleton className="h-4 w-14 rounded-full" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				))}
			</div>

			<div className="shrink-0 px-3 pb-3">
				<Skeleton className="h-8 w-full rounded-md" />
			</div>
		</div>
	);
}
