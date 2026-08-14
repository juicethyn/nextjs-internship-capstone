import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d", "e"];

export function RecentActivitySkeleton() {
	return (
		<Card className="flex h-full flex-col overflow-hidden">
			<CardHeader className="border-b pb-3">
				<Skeleton className="h-4 w-32" />
			</CardHeader>

			<CardContent className="min-h-0 flex-1 overflow-hidden">
				<ul>
					{PLACEHOLDERS.map((placeholder) => (
						<li
							key={placeholder}
							className="flex items-start gap-3 border-b py-3 last:border-b-0"
						>
							<Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />

							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex items-start justify-between gap-3">
									<Skeleton className="h-4 w-64 max-w-full" />
									<Skeleton className="h-3 w-14 shrink-0" />
								</div>

								<div className="flex items-center gap-1.5">
									<Skeleton className="size-5 rounded-md sm:size-6" />
									<Skeleton className="h-3 w-28" />
								</div>
							</div>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
