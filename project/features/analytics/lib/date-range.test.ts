import { describe, expect, it } from "vitest";
import { ANALYTICS_PERIOD_DAYS, getAnalyticsRanges } from "./date-range";

const iso = (date: Date) => date.toISOString();

const DAY_MS = 24 * 60 * 60 * 1000;

describe("getAnalyticsRanges", () => {
	it("ends the current period after today so today is counted", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-18T09:30:00.000Z"));

		expect(iso(ranges.currentEnd)).toBe("2026-08-19T00:00:00.000Z");
	});

	it("starts the current period thirty days before it ends", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-18T09:30:00.000Z"));

		expect(iso(ranges.currentStart)).toBe("2026-07-20T00:00:00.000Z");
	});

	it("butts the previous period directly against the current one", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-18T09:30:00.000Z"));

		expect(iso(ranges.previousEnd)).toBe(iso(ranges.currentStart));
		expect(iso(ranges.previousStart)).toBe("2026-06-20T00:00:00.000Z");
	});

	it("gives both periods the same span", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-18T09:30:00.000Z"));

		const current = ranges.currentEnd.getTime() - ranges.currentStart.getTime();
		const previous =
			ranges.previousEnd.getTime() - ranges.previousStart.getTime();

		expect(current).toBe(ANALYTICS_PERIOD_DAYS * DAY_MS);
		expect(previous).toBe(ANALYTICS_PERIOD_DAYS * DAY_MS);
	});

	it("truncates the anchor to UTC midnight regardless of time of day", () => {
		const morning = getAnalyticsRanges(new Date("2026-08-18T00:00:01.000Z"));
		const night = getAnalyticsRanges(new Date("2026-08-18T23:59:59.999Z"));

		expect(iso(morning.currentStart)).toBe(iso(night.currentStart));
		expect(iso(morning.currentEnd)).toBe(iso(night.currentEnd));
	});

	it("rolls forward across a month end", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-31T18:00:00.000Z"));

		expect(iso(ranges.currentEnd)).toBe("2026-09-01T00:00:00.000Z");
		expect(iso(ranges.currentStart)).toBe("2026-08-02T00:00:00.000Z");
	});

	it("rolls back across a year boundary", () => {
		const ranges = getAnalyticsRanges(new Date("2027-01-05T12:00:00.000Z"));

		expect(iso(ranges.currentStart)).toBe("2026-12-07T00:00:00.000Z");
		expect(iso(ranges.previousStart)).toBe("2026-11-07T00:00:00.000Z");
	});
});
