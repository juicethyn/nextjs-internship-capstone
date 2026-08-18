import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c", "d"];

export function TaskPriorityDistributionSkeleton() {
	return (
		<Card className="h-full">
			<CardHeader className="space-y-2 border-b pb-3">
				<Skeleton className="h-5 w-48" />
				<Skeleton className="h-4 w-36" />
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="flex justify-center">
					<Skeleton className="aspect-square size-50 max-h-50 rounded-full" />
				</div>

				<div className="space-y-2.5">
					{ROWS.map((row) => (
						<div key={row} className="flex items-center gap-2.5">
							<Skeleton className="h-4 w-14 shrink-0" />
							<Skeleton className="h-4 w-5 shrink-0" />
							<Skeleton className="h-1.5 flex-1 rounded-full" />
							<Skeleton className="h-4 w-9 shrink-0" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
