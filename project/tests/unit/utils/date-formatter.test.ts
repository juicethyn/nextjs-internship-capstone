import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	combineDateAndTime,
	formatCommentTimestamp,
	formatProjectDate,
	isOverdue,
} from "@/lib/date-formatter";

const NOW = new Date("2026-08-25T12:00:00.000Z");

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ago = (milliseconds: number) => new Date(NOW.getTime() - milliseconds);

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("formatProjectDate", () => {
	it("formats a Date in UTC", () => {
		expect(formatProjectDate(new Date("2026-08-25T12:00:00.000Z"))).toBe(
			"Aug 25, 2026",
		);
	});

	it("formats an ISO string the same way", () => {
		expect(formatProjectDate("2026-08-25T12:00:00.000Z")).toBe("Aug 25, 2026");
	});

	it("does not drift across the day boundary in UTC", () => {
		expect(formatProjectDate("2026-08-25T23:59:59.999Z")).toBe("Aug 25, 2026");
		expect(formatProjectDate("2026-08-25T00:00:00.000Z")).toBe("Aug 25, 2026");
	});

	it("returns an empty string for missing dates by default", () => {
		expect(formatProjectDate(null)).toBe("");
		expect(formatProjectDate(undefined)).toBe("");
		expect(formatProjectDate("")).toBe("");
	});

	it("returns the fallback for an unparseable date", () => {
		expect(formatProjectDate("not-a-date")).toBe("");
	});

	it("uses a custom fallback when one is given", () => {
		expect(formatProjectDate(null, "No due date")).toBe("No due date");
		expect(formatProjectDate("not-a-date", "No due date")).toBe("No due date");
	});
});

describe("combineDateAndTime", () => {
	it("merges a time string into a date", () => {
		const result = combineDateAndTime(new Date(2026, 7, 25), "14:30");

		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(7);
		expect(result.getDate()).toBe(25);
		expect(result.getHours()).toBe(14);
		expect(result.getMinutes()).toBe(30);
	});

	it("clears seconds and milliseconds", () => {
		const result = combineDateAndTime(new Date(2026, 7, 25), "09:05");

		expect(result.getSeconds()).toBe(0);
		expect(result.getMilliseconds()).toBe(0);
	});

	it("falls back to midnight for an unparseable time", () => {
		const result = combineDateAndTime(new Date(2026, 7, 25), "not-a-time");

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
	});

	it("falls back to zero minutes when only an hour is given", () => {
		const result = combineDateAndTime(new Date(2026, 7, 25), "08");

		expect(result.getHours()).toBe(8);
		expect(result.getMinutes()).toBe(0);
	});

	it("does not mutate the input date", () => {
		const original = new Date(2026, 7, 25);

		combineDateAndTime(original, "14:30");

		expect(original.getHours()).toBe(0);
	});
});

describe("formatCommentTimestamp", () => {
	it("shows one second for anything under a second old", () => {
		expect(formatCommentTimestamp(NOW)).toBe("1s ago");
		expect(formatCommentTimestamp(ago(999))).toBe("1s ago");
	});

	it("counts seconds under a minute", () => {
		expect(formatCommentTimestamp(ago(30 * SECOND))).toBe("30s ago");
		expect(formatCommentTimestamp(ago(59 * SECOND))).toBe("59s ago");
	});

	it("counts minutes under an hour", () => {
		expect(formatCommentTimestamp(ago(MINUTE))).toBe("1min ago");
		expect(formatCommentTimestamp(ago(45 * MINUTE))).toBe("45min ago");
	});

	it("counts hours under a day", () => {
		expect(formatCommentTimestamp(ago(HOUR))).toBe("1hr ago");
		expect(formatCommentTimestamp(ago(23 * HOUR))).toBe("23hr ago");
	});

	it("uses the singular for exactly one day", () => {
		expect(formatCommentTimestamp(ago(DAY))).toBe("1 day ago");
	});

	it("uses the plural beyond one day", () => {
		expect(formatCommentTimestamp(ago(2 * DAY))).toBe("2 days ago");
		expect(formatCommentTimestamp(ago(6 * DAY))).toBe("6 days ago");
	});

	it("switches to an absolute timestamp past a week", () => {
		expect(formatCommentTimestamp(new Date(2026, 7, 15, 20, 0))).toBe(
			"August 15, 2026 at 8:00pm",
		);
	});

	it("formats a morning absolute timestamp", () => {
		expect(formatCommentTimestamp(new Date(2026, 7, 10, 9, 5))).toBe(
			"August 10, 2026 at 9:05am",
		);
	});

	it("accepts an ISO string", () => {
		expect(formatCommentTimestamp(ago(2 * HOUR).toISOString())).toBe("2hr ago");
	});

	it("returns an empty string for an unparseable date", () => {
		expect(formatCommentTimestamp("not-a-date")).toBe("");
	});
});

describe("isOverdue", () => {
	it("flags a date before today in UTC", () => {
		expect(isOverdue("2026-08-24T00:00:00.000Z")).toBe(true);
		expect(isOverdue("2020-01-01T00:00:00.000Z")).toBe(true);
	});

	it("does not flag today, even at the very end of the day", () => {
		expect(isOverdue("2026-08-25T00:00:00.000Z")).toBe(false);
		expect(isOverdue("2026-08-25T23:59:59.999Z")).toBe(false);
	});

	it("does not flag a future date", () => {
		expect(isOverdue("2026-08-26T00:00:00.000Z")).toBe(false);
		expect(isOverdue("2027-01-01T00:00:00.000Z")).toBe(false);
	});

	it("accepts a Date as well as a string", () => {
		expect(isOverdue(new Date("2026-08-24T00:00:00.000Z"))).toBe(true);
		expect(isOverdue(new Date("2026-08-26T00:00:00.000Z"))).toBe(false);
	});

	it("treats a missing date as not overdue", () => {
		expect(isOverdue(null)).toBe(false);
		expect(isOverdue(undefined)).toBe(false);
		expect(isOverdue("")).toBe(false);
	});

	it("treats an unparseable date as not overdue", () => {
		expect(isOverdue("not-a-date")).toBe(false);
	});
});
