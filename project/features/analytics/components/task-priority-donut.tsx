"use client";

import { Label, Pie, PieChart } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export const PRIORITY_CHART_CONFIG = {
	high: { label: "High", color: "var(--destructive)" },
	medium: { label: "Medium", color: "var(--chart-4)" },
	low: { label: "Low", color: "var(--chart-2)" },
	none: { label: "None", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export type PriorityKey = keyof typeof PRIORITY_CHART_CONFIG;

type TaskPriorityDonutProps = {
	counts: Record<PriorityKey, number>;
	total: number;
};

export function TaskPriorityDonut({ counts, total }: TaskPriorityDonutProps) {
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

	const data = (Object.keys(PRIORITY_CHART_CONFIG) as PriorityKey[])
		.map((priority) => ({
			priority,
			count: counts[priority],
			fill: `var(--color-${priority})`,
		}))
		.filter((entry) => entry.count > 0);

	return (
		<ChartContainer
			config={PRIORITY_CHART_CONFIG}
			className="mx-auto aspect-square max-h-50"
		>
			<PieChart>
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel nameKey="priority" />}
				/>

				<Pie
					data={data}
					dataKey="count"
					nameKey="priority"
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
