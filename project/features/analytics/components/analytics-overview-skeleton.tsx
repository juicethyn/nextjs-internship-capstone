import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsStatCardSkeleton } from "./analytics-stat-card-skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d"];

export function AnalyticsOverviewSkeleton() {
	return (
		<section className="space-y-3">
			<Skeleton className="h-4 w-28" />

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{PLACEHOLDERS.map((placeholder) => (
					<AnalyticsStatCardSkeleton key={placeholder} />
				))}
			</div>
		</section>
	);
}
