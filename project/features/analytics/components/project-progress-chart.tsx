"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProgressRow } from "@/features/analytics/hooks/use-project-progress";
import {
	getLabelMaxChars,
	truncateLabel,
} from "@/features/analytics/lib/chart-label";
import { useIsMobile } from "@/hooks/use-mobile";

const CHART_CONFIG = {
	value: { label: "Progress" },
} satisfies ChartConfig;

const MOBILE_ROW_HEIGHT = 44;

type ProgressMode = "projects" | "statuses";

type ProjectProgressChartProps = {
	rows: ProgressRow[];
	mode: ProgressMode;
};

export function ProjectProgressChart({
	rows,
	mode,
}: ProjectProgressChartProps) {
	const isMobile = useIsMobile();

	const isPercent = mode === "projects";

	// Bars lie down on a narrow screen so every label gets a full-width row
	// instead of being crushed into an x-axis tick. Both modes flip together so
	// the card reads the same way whichever one you are looking at.
	const isHorizontal = isMobile;

	const labels = new Map(rows.map((row) => [row.key, row.label]));

	const maxChars = getLabelMaxChars(rows.length);

	const formatName = (key: string) =>
		truncateLabel(labels.get(key) ?? "", maxChars);

	const formatValue = (value: unknown) =>
		isPercent ? `${value}%` : `${value}`;

	const tooltip = (
		<ChartTooltip
			cursor={false}
			content={
				<ChartTooltipContent
					labelFormatter={(_label, payload) =>
						payload?.[0]?.payload?.label ?? ""
					}
					formatter={(value) => (
						<span className="font-mono font-medium text-foreground tabular-nums">
							{isPercent ? `${value}%` : `${value} tasks`}
						</span>
					)}
				/>
			}
		/>
	);

	if (isHorizontal) {
		return (
			<ChartContainer
				config={CHART_CONFIG}
				className="aspect-auto w-full"
				style={{ height: rows.length * MOBILE_ROW_HEIGHT }}
			>
				<BarChart
					accessibilityLayer
					data={rows}
					layout="vertical"
					margin={{ right: 40 }}
				>
					<CartesianGrid horizontal={false} />

					<XAxis
						type="number"
						allowDecimals={false}
						domain={isPercent ? [0, 100] : undefined}
						hide
					/>

					<YAxis
						type="category"
						dataKey="key"
						width={104}
						interval={0}
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tickFormatter={formatName}
					/>

					{tooltip}

					<Bar dataKey="value" radius={[0, 4, 4, 0]}>
						{rows.map((row) => (
							<Cell key={row.key} fill={row.color} />
						))}

						<LabelList
							dataKey="value"
							position="right"
							offset={8}
							fontSize={12}
							className="fill-foreground"
							formatter={formatValue}
						/>
					</Bar>
				</BarChart>
			</ChartContainer>
		);
	}

	return (
		<ChartContainer
			config={CHART_CONFIG}
			className="aspect-auto h-full min-h-56 w-full"
		>
			<BarChart accessibilityLayer data={rows} margin={{ top: 24 }}>
				<CartesianGrid vertical={false} />

				<YAxis
					tickLine={false}
					axisLine={false}
					width={44}
					allowDecimals={false}
					domain={isPercent ? [0, 100] : undefined}
					tickFormatter={formatValue}
				/>

				<XAxis
					dataKey="key"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					interval={0}
					tickFormatter={formatName}
				/>

				{tooltip}

				<Bar dataKey="value" radius={[4, 4, 0, 0]}>
					{rows.map((row) => (
						<Cell key={row.key} fill={row.color} />
					))}

					<LabelList
						dataKey="value"
						position="top"
						offset={8}
						fontSize={12}
						className="fill-foreground"
						formatter={formatValue}
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
