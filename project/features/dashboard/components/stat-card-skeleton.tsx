import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
	return (
		<Card size="sm">
			<CardHeader>
				<Skeleton className="h-4 w-28" />

				<CardAction>
					<Skeleton className="size-4 rounded" />
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-2">
				<Skeleton className="h-7 w-12" />
				<Skeleton className="h-3 w-24" />
			</CardContent>
		</Card>
	);
}
