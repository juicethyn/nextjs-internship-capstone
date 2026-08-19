import { describe, expect, it } from "vitest";
import {
	getAnalyticsRanges,
	getPeriodDays,
	getPeriodLabel,
} from "./date-range";

const iso = (date: Date) => date.toISOString();

const DAY_MS = 24 * 60 * 60 * 1000;

const NOW = new Date("2026-08-18T09:30:00.000Z");

describe("getPeriodDays", () => {
	it("maps every selectable period to its window length", () => {
		expect(getPeriodDays("7d")).toBe(7);
		expect(getPeriodDays("30d")).toBe(30);
		expect(getPeriodDays("90d")).toBe(90);
		expect(getPeriodDays("12m")).toBe(365);
	});
});

describe("getPeriodLabel", () => {
	it("maps every selectable period to its label", () => {
		expect(getPeriodLabel("7d")).toBe("Last 7 days");
		expect(getPeriodLabel("12m")).toBe("Last 12 months");
	});
});

describe("getAnalyticsRanges", () => {
	it("ends the current period after today so today is counted", () => {
		expect(iso(getAnalyticsRanges(NOW, 30).currentEnd)).toBe(
			"2026-08-19T00:00:00.000Z",
		);
	});

	it("starts the current period one window before it ends", () => {
		expect(iso(getAnalyticsRanges(NOW, 30).currentStart)).toBe(
			"2026-07-20T00:00:00.000Z",
		);
		expect(iso(getAnalyticsRanges(NOW, 7).currentStart)).toBe(
			"2026-08-12T00:00:00.000Z",
		);
	});

	it("butts the previous period directly against the current one", () => {
		const ranges = getAnalyticsRanges(NOW, 30);

		expect(iso(ranges.previousEnd)).toBe(iso(ranges.currentStart));
		expect(iso(ranges.previousStart)).toBe("2026-06-20T00:00:00.000Z");
	});

	it("gives both periods the same span for every window", () => {
		for (const days of [7, 30, 90, 365]) {
			const ranges = getAnalyticsRanges(NOW, days);

			const current =
				ranges.currentEnd.getTime() - ranges.currentStart.getTime();
			const previous =
				ranges.previousEnd.getTime() - ranges.previousStart.getTime();

			expect(current).toBe(days * DAY_MS);
			expect(previous).toBe(days * DAY_MS);
		}
	});

	it("reports the window length so the velocity divisor can follow it", () => {
		expect(getAnalyticsRanges(NOW, 7).days).toBe(7);
		expect(getAnalyticsRanges(NOW, 365).days).toBe(365);
	});

	it("reaches back a full year for the twelve month window", () => {
		const ranges = getAnalyticsRanges(NOW, 365);

		expect(iso(ranges.currentStart)).toBe("2025-08-19T00:00:00.000Z");
		expect(iso(ranges.previousStart)).toBe("2024-08-19T00:00:00.000Z");
	});

	it("truncates the anchor to UTC midnight regardless of time of day", () => {
		const morning = getAnalyticsRanges(new Date("2026-08-18T00:00:01Z"), 30);
		const night = getAnalyticsRanges(new Date("2026-08-18T23:59:59Z"), 30);

		expect(iso(morning.currentStart)).toBe(iso(night.currentStart));
		expect(iso(morning.currentEnd)).toBe(iso(night.currentEnd));
	});

	it("rolls forward across a month end", () => {
		const ranges = getAnalyticsRanges(new Date("2026-08-31T18:00:00Z"), 30);

		expect(iso(ranges.currentEnd)).toBe("2026-09-01T00:00:00.000Z");
		expect(iso(ranges.currentStart)).toBe("2026-08-02T00:00:00.000Z");
	});

	it("rolls back across a year boundary", () => {
		const ranges = getAnalyticsRanges(new Date("2027-01-05T12:00:00Z"), 30);

		expect(iso(ranges.currentStart)).toBe("2026-12-07T00:00:00.000Z");
		expect(iso(ranges.previousStart)).toBe("2026-11-07T00:00:00.000Z");
	});
});
