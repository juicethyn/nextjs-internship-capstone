export const EMPTY_METRIC = "—";

export type DeltaSign = "up" | "down" | "flat";

export type MetricDelta = {
	label: string;
	sign: DeltaSign;
};

export function formatMetricValue(value: number | null, decimals: number) {
	if (value === null) return EMPTY_METRIC;

	return value.toFixed(decimals);
}

export function formatPercent(value: number | null) {
	if (value === null) return EMPTY_METRIC;

	return `${Math.round(value)}%`;
}

export function formatDelta(
	current: number | null,
	previous: number | null,
	decimals: number,
	suffix = "",
): MetricDelta | null {
	if (current === null || previous === null) return null;

	const delta = Number((current - previous).toFixed(decimals));

	if (delta === 0) {
		return { label: "No change from last period", sign: "flat" };
	}

	const sign = delta > 0 ? "+" : "-";
	const magnitude = Math.abs(delta).toFixed(decimals);

	return {
		label: `${sign}${magnitude}${suffix} last period`,
		sign: delta > 0 ? "up" : "down",
	};
}
