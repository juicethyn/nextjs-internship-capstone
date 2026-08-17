const DAY_MS = 24 * 60 * 60 * 1000;

export type OverviewRanges = {
	todayStart: Date;
	tomorrowStart: Date;
	yesterdayStart: Date;
	dayBeforeStart: Date;
	weekStart: Date;
	weekEnd: Date;
};

export function getOverviewRanges(now: Date): OverviewRanges {
	const todayStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);

	const mondayOffset = (now.getUTCDay() + 6) % 7;
	const weekStart = new Date(todayStart.getTime() - mondayOffset * DAY_MS);

	return {
		todayStart,
		tomorrowStart: new Date(todayStart.getTime() + DAY_MS),
		yesterdayStart: new Date(todayStart.getTime() - DAY_MS),
		dayBeforeStart: new Date(todayStart.getTime() - 2 * DAY_MS),
		weekStart,
		weekEnd: new Date(weekStart.getTime() + 7 * DAY_MS),
	};
}
