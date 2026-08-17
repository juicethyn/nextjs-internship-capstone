import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c"];

export function ContinueWorkingSkeleton() {
	return (
		<Card className="h-full">
			<CardHeader className="border-b pb-3">
				<Skeleton className="h-5 w-40" />
			</CardHeader>

			<CardContent className="space-y-3">
				{ROWS.map((row) => (
					<div key={row} className="space-y-2.5 rounded-lg border p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex min-w-0 items-center gap-2">
								<Skeleton className="size-5 rounded-md sm:size-6" />
								<Skeleton className="h-4 w-36" />
							</div>

							<Skeleton className="h-3 w-20 shrink-0" />
						</div>

						<div className="flex items-center gap-2">
							<Skeleton className="h-1.5 flex-1 rounded-full" />
							<Skeleton className="h-3 w-8 shrink-0" />
						</div>

						<Skeleton className="h-3 w-28" />
					</div>
				))}
			</CardContent>
		</Card>
	);
}
