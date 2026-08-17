import { ContinueWorkingSkeleton } from "./continue-working-skeleton";
import { MyTasksSkeleton } from "./my-tasks-skeleton";

export function DashboardWorkSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<MyTasksSkeleton />

			<ContinueWorkingSkeleton />
		</div>
	);
}
