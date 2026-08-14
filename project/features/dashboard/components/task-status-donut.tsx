"use client";

import { Label, Pie, PieChart } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export const STATUS_CHART_CONFIG = {
	todo: { label: "To Do", color: "var(--chart-1)" },
	in_progress: { label: "In Progress", color: "var(--chart-4)" },
	done: { label: "Done", color: "var(--chart-3)" },
} satisfies ChartConfig;

export type StatusKey = keyof typeof STATUS_CHART_CONFIG;

type TaskStatusDonutProps = {
	counts: Record<StatusKey, number>;
	total: number;
};

export function TaskStatusDonut({ counts, total }: TaskStatusDonutProps) {
	if (total === 0) {
		return (
			<div className="flex aspect-square max-h-50 w-full items-center justify-center">
				<div className="flex size-37.5 flex-col items-center justify-center rounded-full border-18 border-muted text-center">
					<span className="text-2xl font-semibold tabular-nums">0</span>
					<span className="text-xs text-muted-foreground">Total Tasks</span>
				</div>
			</div>
		);
	}

	const data = (Object.keys(STATUS_CHART_CONFIG) as StatusKey[])
		.map((status) => ({
			status,
			count: counts[status],
			fill: `var(--color-${status})`,
		}))
		.filter((entry) => entry.count > 0);

	return (
		<ChartContainer
			config={STATUS_CHART_CONFIG}
			className="mx-auto aspect-square max-h-50"
		>
			<PieChart>
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel nameKey="status" />}
				/>

				<Pie
					data={data}
					dataKey="count"
					nameKey="status"
					innerRadius={60}
					strokeWidth={2}
					paddingAngle={data.length > 1 ? 2 : 0}
					stroke="var(--card)"
				>
					<Label
						content={({ viewBox }) => {
							if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
								return null;
							}

							const cx = viewBox.cx ?? 0;
							const cy = viewBox.cy ?? 0;

							return (
								<text
									x={cx}
									y={cy}
									textAnchor="middle"
									dominantBaseline="middle"
								>
									<tspan
										x={cx}
										y={cy - 6}
										className="fill-foreground text-2xl font-semibold tabular-nums"
									>
										{total}
									</tspan>

									<tspan
										x={cx}
										y={cy + 16}
										className="fill-muted-foreground text-xs"
									>
										Total Tasks
									</tspan>
								</text>
							);
						}}
					/>
				</Pie>
			</PieChart>
		</ChartContainer>
	);
}
