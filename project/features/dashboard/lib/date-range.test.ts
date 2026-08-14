import { describe, expect, it } from "vitest";
import { getOverviewRanges } from "./date-range";

const iso = (date: Date) => date.toISOString();

describe("getOverviewRanges", () => {
	it("anchors the week to the preceding Monday", () => {
		const ranges = getOverviewRanges(new Date("2026-08-14T09:30:00.000Z"));

		expect(iso(ranges.weekStart)).toBe("2026-08-10T00:00:00.000Z");
		expect(iso(ranges.weekEnd)).toBe("2026-08-17T00:00:00.000Z");
	});

	it("keeps Sunday in the week that started the previous Monday", () => {
		const ranges = getOverviewRanges(new Date("2026-08-16T23:59:59.999Z"));

		expect(iso(ranges.weekStart)).toBe("2026-08-10T00:00:00.000Z");
		expect(iso(ranges.weekEnd)).toBe("2026-08-17T00:00:00.000Z");
	});

	it("starts a new week on Monday itself", () => {
		const ranges = getOverviewRanges(new Date("2026-08-17T00:00:00.000Z"));

		expect(iso(ranges.weekStart)).toBe("2026-08-17T00:00:00.000Z");
		expect(iso(ranges.weekEnd)).toBe("2026-08-24T00:00:00.000Z");
	});

	it("truncates today to UTC midnight and steps back two days", () => {
		const ranges = getOverviewRanges(new Date("2026-08-14T09:30:00.000Z"));

		expect(iso(ranges.todayStart)).toBe("2026-08-14T00:00:00.000Z");
		expect(iso(ranges.yesterdayStart)).toBe("2026-08-13T00:00:00.000Z");
		expect(iso(ranges.dayBeforeStart)).toBe("2026-08-12T00:00:00.000Z");
	});

	it("rolls back across a month boundary", () => {
		const ranges = getOverviewRanges(new Date("2026-09-01T06:00:00.000Z"));

		expect(iso(ranges.yesterdayStart)).toBe("2026-08-31T00:00:00.000Z");
		expect(iso(ranges.dayBeforeStart)).toBe("2026-08-30T00:00:00.000Z");
	});

	it("rolls back across a year boundary", () => {
		const ranges = getOverviewRanges(new Date("2027-01-01T00:00:00.000Z"));

		expect(iso(ranges.yesterdayStart)).toBe("2026-12-31T00:00:00.000Z");
		expect(iso(ranges.weekStart)).toBe("2026-12-28T00:00:00.000Z");
	});

	it("spans exactly seven days", () => {
		const ranges = getOverviewRanges(new Date("2026-08-14T09:30:00.000Z"));
		const span = ranges.weekEnd.getTime() - ranges.weekStart.getTime();

		expect(span).toBe(7 * 24 * 60 * 60 * 1000);
	});
});
