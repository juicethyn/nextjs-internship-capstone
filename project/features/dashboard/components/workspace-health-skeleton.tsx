import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["a", "b", "c"];

export function WorkspaceHealthSkeleton() {
	return (
		<Card className="h-full">
			<CardHeader className="space-y-2 border-b pb-3">
				<Skeleton className="h-5 w-36" />
				<Skeleton className="h-4 w-44" />
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="flex justify-center">
					<Skeleton className="aspect-square size-50 max-h-50 rounded-full" />
				</div>

				<div className="space-y-2">
					{ROWS.map((row) => (
						<div key={row} className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Skeleton className="size-2.5 rounded-xs" />
								<Skeleton className="h-4 w-24" />
							</div>

							<Skeleton className="h-4 w-14" />
						</div>
					))}
				</div>

				<div className="space-y-3">
					{ROWS.map((row) => (
						<Skeleton key={row} className="h-1.5 w-full rounded-full" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
