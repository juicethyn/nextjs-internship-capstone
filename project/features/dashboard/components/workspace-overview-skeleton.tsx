import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./stat-card-skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d"];

export function WorkspaceOverviewSkeleton() {
	return (
		<section className="space-y-3">
			<Skeleton className="h-4 w-40" />

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{PLACEHOLDERS.map((placeholder) => (
					<StatCardSkeleton key={placeholder} />
				))}
			</div>
		</section>
	);
}
