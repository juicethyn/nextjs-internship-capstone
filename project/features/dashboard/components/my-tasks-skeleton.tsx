import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c"];

export function MyTasksSkeleton() {
	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<Skeleton className="h-5 w-28" />
			</CardHeader>

			<CardContent className="space-y-4">
				<Skeleton className="h-9 w-full rounded-md sm:w-72" />

				<ul>
					{ROWS.map((row) => (
						<li key={row} className="border-b py-3 last:border-b-0">
							<div className="flex items-start justify-between gap-3">
								<Skeleton className="h-4 w-56 max-w-full" />
								<Skeleton className="h-5 w-16 shrink-0 rounded-md" />
							</div>

							<div className="mt-2 flex items-center gap-1.5">
								<Skeleton className="size-5 rounded-md sm:size-6" />
								<Skeleton className="h-3 w-40" />
							</div>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
