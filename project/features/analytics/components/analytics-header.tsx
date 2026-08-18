import { Archive, CalendarRange, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsHeader() {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="min-w-0 space-y-1">
				<h1 className="text-2xl font-bold lg:text-3xl">Analytics</h1>

				<p className="text-sm text-muted-foreground">
					Workspace performance overview
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<CalendarRange className="size-4" />
					Date Range
				</Button>

				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<FolderKanban className="size-4" />
					All Projects
				</Button>

				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full sm:w-auto"
				>
					<Archive className="size-4" />
					Include Archived
				</Button>
			</div>
		</div>
	);
}
