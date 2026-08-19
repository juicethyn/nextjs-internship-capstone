import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c", "d", "e"];

export function TeamContributionsSkeleton() {
	return (
		<Card>
			<CardHeader className="space-y-2 border-b pb-3">
				<Skeleton className="h-5 w-44" />
				<Skeleton className="h-4 w-56" />
			</CardHeader>

			<CardContent className="space-y-4">
				{ROWS.map((row) => (
					<div
						key={row}
						className="flex flex-wrap items-center gap-x-3 gap-y-2"
					>
						<Skeleton className="order-1 h-4 w-5 shrink-0" />
						<Skeleton className="order-2 size-8 shrink-0 rounded-full" />
						<Skeleton className="order-3 h-4 min-w-0 flex-1 md:w-40 md:flex-none" />
						<Skeleton className="order-4 h-4 w-8 shrink-0 md:order-5" />
						<Skeleton className="order-5 h-2 w-full rounded-full md:order-4 md:w-auto md:flex-1" />
					</div>
				))}
			</CardContent>
		</Card>
	);
}
