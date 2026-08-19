import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BARS = [
	{ key: "a", height: "h-40", width: "w-11/12" },
	{ key: "b", height: "h-32", width: "w-9/12" },
	{ key: "c", height: "h-36", width: "w-10/12" },
	{ key: "d", height: "h-24", width: "w-7/12" },
	{ key: "e", height: "h-28", width: "w-8/12" },
	{ key: "f", height: "h-16", width: "w-4/12" },
];

export function ProjectProgressSkeleton() {
	return (
		<Card className="h-full">
			<CardHeader className="space-y-2 border-b pb-3">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-44" />
			</CardHeader>

			<CardContent className="flex min-h-0 flex-1 flex-col justify-end gap-3">
				<div className="flex flex-col gap-3 md:hidden">
					{BARS.map((bar) => (
						<div key={bar.key} className="flex items-center gap-3">
							<Skeleton className="h-3 w-20 shrink-0" />
							<Skeleton className={`h-6 rounded-md ${bar.width}`} />
						</div>
					))}
				</div>

				<div className="hidden flex-1 items-end justify-around gap-3 md:flex">
					{BARS.map((bar) => (
						<Skeleton
							key={bar.key}
							className={`w-full max-w-12 rounded-t-md ${bar.height}`}
						/>
					))}
				</div>

				<div className="hidden items-center justify-around gap-3 md:flex">
					{BARS.map((bar) => (
						<Skeleton key={bar.key} className="h-3 w-full max-w-12" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}
