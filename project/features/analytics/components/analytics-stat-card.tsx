import type { LucideIcon } from "lucide-react";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	EMPTY_METRIC,
	type MetricDelta,
} from "@/features/analytics/lib/format-metric";
import { cn } from "@/lib/utils";

type DeltaDirection = "higher-is-better" | "lower-is-better";

type AnalyticsStatCardProps = {
	title: string;
	value: string;
	unit: string;
	icon: LucideIcon;
	delta?: MetricDelta | null;
	deltaDirection?: DeltaDirection;
};

const POSITIVE_CLASS = "text-emerald-700 dark:text-emerald-400";
const NEGATIVE_CLASS = "text-red-600 dark:text-red-400";
const FLAT_CLASS = "text-muted-foreground/70";

function getDeltaClass(delta: MetricDelta, direction: DeltaDirection) {
	if (delta.sign === "flat") return FLAT_CLASS;

	const isGood =
		direction === "higher-is-better"
			? delta.sign === "up"
			: delta.sign === "down";

	return isGood ? POSITIVE_CLASS : NEGATIVE_CLASS;
}

export function AnalyticsStatCard({
	title,
	value,
	unit,
	icon: Icon,
	delta,
	deltaDirection = "higher-is-better",
}: AnalyticsStatCardProps) {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
					{title}
				</CardTitle>

				<CardAction>
					<Icon className="size-4 text-muted-foreground" />
				</CardAction>
			</CardHeader>

			<CardContent className="space-y-1">
				<p className="text-2xl font-semibold tabular-nums leading-none">
					{value}

					{value !== EMPTY_METRIC && (
						<span className="ml-1 text-sm font-normal text-muted-foreground">
							{unit}
						</span>
					)}
				</p>

				{delta && (
					<p className={cn("text-xs", getDeltaClass(delta, deltaDirection))}>
						{delta.label}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
