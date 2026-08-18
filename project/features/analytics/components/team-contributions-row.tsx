"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ContributionRow } from "@/features/analytics/hooks/use-team-contributions";
import { getBarPercent, getRankColor } from "@/features/analytics/lib/rank";
import { getInitials, memberDisplayName } from "@/lib/user-display";

type TeamContributionsRowProps = {
	row: ContributionRow;
	rank: number;
	topCompleted: number;
};

export function TeamContributionsRow({
	row,
	rank,
	topCompleted,
}: TeamContributionsRowProps) {
	const name = memberDisplayName(row);
	const percent = getBarPercent(row.completed, topCompleted);
	const color = getRankColor(rank);

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<span className="order-1 w-5 shrink-0 text-xs text-muted-foreground tabular-nums">
				{rank + 1}
			</span>

			<Avatar className="order-2 size-8 shrink-0">
				{row.imageUrl && <AvatarImage src={row.imageUrl} alt={name} />}

				<AvatarFallback className="text-[10px]">
					{getInitials(row.firstName, row.lastName)}
				</AvatarFallback>
			</Avatar>

			<span className="order-3 min-w-0 flex-1 truncate text-sm font-medium md:w-40 md:flex-none">
				{name}
			</span>

			<span className="order-4 w-8 shrink-0 text-right text-sm font-medium tabular-nums md:order-5">
				{row.completed}
			</span>

			<div
				className="order-5 h-2 w-full overflow-hidden rounded-full bg-secondary md:order-4 md:w-auto md:flex-1"
				role="progressbar"
				aria-label={`${name} completed tasks`}
				aria-valuenow={row.completed}
				aria-valuemin={0}
				aria-valuemax={topCompleted}
			>
				<div
					className="h-full rounded-full transition-[width] duration-300"
					style={{ width: `${percent}%`, backgroundColor: color }}
				/>
			</div>
		</div>
	);
}
