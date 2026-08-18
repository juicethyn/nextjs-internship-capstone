const DAY_MS = 24 * 60 * 60 * 1000;

export const ANALYTICS_PERIOD_DAYS = 30;

export type AnalyticsRanges = {
	currentStart: Date;
	currentEnd: Date;
	previousStart: Date;
	previousEnd: Date;
};

export function getAnalyticsRanges(now: Date): AnalyticsRanges {
	const todayStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);

	const periodMs = ANALYTICS_PERIOD_DAYS * DAY_MS;

	const currentEnd = new Date(todayStart.getTime() + DAY_MS);
	const currentStart = new Date(currentEnd.getTime() - periodMs);

	return {
		currentStart,
		currentEnd,
		previousStart: new Date(currentStart.getTime() - periodMs),
		previousEnd: currentStart,
	};
}
