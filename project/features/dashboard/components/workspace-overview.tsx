"use client";

import {
	CalendarClock,
	CircleCheckBig,
	FolderKanban,
	TriangleAlert,
	Users,
} from "lucide-react";
import { useWorkspaceOverview } from "@/features/dashboard/hooks/use-workspace-overview";
import { StatCard } from "./stat-card";
import { WorkspaceOverviewSkeleton } from "./workspace-overview-skeleton";

type WorkspaceOverviewProps = {
	workspaceSlug: string;
};

const HEADING_CLASS =
	"text-xs font-bold uppercase tracking-wide text-muted-foreground";

function formatCompletionDelta(total: number, previousDay: number) {
	const delta = total - previousDay;

	if (delta === 0) return "Same as previous day";

	return `${delta > 0 ? "+" : ""}${delta} from previous day`;
}

export function WorkspaceOverview({ workspaceSlug }: WorkspaceOverviewProps) {
	const { data, isLoading, isError } = useWorkspaceOverview({ workspaceSlug });

	if (isLoading) {
		return <WorkspaceOverviewSkeleton />;
	}

	if (isError || !data) {
		return (
			<section className="space-y-3">
				<h2 className={HEADING_CLASS}>Workspace Overview</h2>

				<div className="flex items-center gap-3 rounded-xl bg-card px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
					<TriangleAlert className="size-4 shrink-0" />
					<span>Couldn't load workspace overview.</span>
				</div>
			</section>
		);
	}

	const { activeProjects, teamMembers, completedYesterday, dueThisWeek } = data;

	return (
		<section className="space-y-3">
			<h2 className={HEADING_CLASS}>Workspace Overview</h2>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Active Projects"
					value={activeProjects.total}
					icon={FolderKanban}
					iconClassName="text-chart-1"
					hint={
						activeProjects.newThisWeek > 0
							? `+${activeProjects.newThisWeek} new this week`
							: undefined
					}
				/>

				<StatCard
					title="Team Members"
					value={teamMembers.total}
					icon={Users}
					iconClassName="text-chart-2"
					hint={
						teamMembers.pendingInvites
							? `+${teamMembers.pendingInvites} pending invites`
							: undefined
					}
				/>

				<StatCard
					title="Completed Yesterday"
					value={completedYesterday.total}
					icon={CircleCheckBig}
					iconClassName="text-chart-3"
					hint={formatCompletionDelta(
						completedYesterday.total,
						completedYesterday.previousDay,
					)}
				/>

				<StatCard
					title="Due This Week"
					value={dueThisWeek.total}
					icon={CalendarClock}
					iconClassName="text-chart-4"
					hint={
						dueThisWeek.overdue > 0
							? `${dueThisWeek.overdue} overdue`
							: undefined
					}
				/>
			</div>
		</section>
	);
}
