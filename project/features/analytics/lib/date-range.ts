import { ANALYTICS_PERIODS } from "../constants";
import type { AnalyticsPeriod } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AnalyticsRanges = {
	currentStart: Date;
	currentEnd: Date;
	previousStart: Date;
	previousEnd: Date;
	days: number;
};

export function getPeriodDays(period: AnalyticsPeriod) {
	return (
		ANALYTICS_PERIODS.find((option) => option.value === period)?.days ?? 30
	);
}

export function getPeriodLabel(period: AnalyticsPeriod) {
	return (
		ANALYTICS_PERIODS.find((option) => option.value === period)?.label ??
		"Last 30 days"
	);
}

export function getAnalyticsRanges(now: Date, days: number): AnalyticsRanges {
	const todayStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);

	const periodMs = days * DAY_MS;

	const currentEnd = new Date(todayStart.getTime() + DAY_MS);
	const currentStart = new Date(currentEnd.getTime() - periodMs);

	return {
		currentStart,
		currentEnd,
		previousStart: new Date(currentStart.getTime() - periodMs),
		previousEnd: currentStart,
		days,
	};
}
