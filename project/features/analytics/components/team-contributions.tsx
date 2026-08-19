"use client";

import { TriangleAlert } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTeamContributions } from "@/features/analytics/hooks/use-team-contributions";
import { useAnalyticsFilters } from "@/features/analytics/store";
import { TeamContributionsRow } from "./team-contributions-row";
import { TeamContributionsSkeleton } from "./team-contributions-skeleton";

type TeamContributionsProps = {
	workspaceSlug: string;
};

export function TeamContributions({ workspaceSlug }: TeamContributionsProps) {
	const filters = useAnalyticsFilters();

	const { data, isLoading, isError } = useTeamContributions({
		workspaceSlug,
		filters,
	});

	if (isLoading) {
		return <TeamContributionsSkeleton />;
	}

	return (
		<Card>
			<CardHeader className="border-b pb-3">
				<CardTitle>Team Contributions</CardTitle>

				<CardDescription>
					Tasks completed per member this period
				</CardDescription>
			</CardHeader>

			<CardContent>
				{isError || !data ? (
					<div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
						<TriangleAlert className="size-4 shrink-0" />
						<span>Couldn't load team contributions.</span>
					</div>
				) : data.rows.length === 0 ? (
					<p className="py-6 text-sm text-muted-foreground">
						No members to show yet.
					</p>
				) : (
					<div className="space-y-4">
						{data.rows.map((row, index) => (
							<TeamContributionsRow
								key={row.userId}
								row={row}
								rank={index}
								topCompleted={data.topCompleted}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
