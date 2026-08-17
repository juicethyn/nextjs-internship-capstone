import { describe, expect, it } from "vitest";
import { formatProjectDate } from "../../../lib/date-formatter";
import {
	addDays,
	countByPriority,
	filterDeadlines,
	getUpcomingDeadlines,
	getWeekRange,
	groupDeadlinesByDay,
	isCompleted,
	isSameLocalDay,
	startOfWeekLocal,
	toCalendarDay,
	toCalendarEvent,
} from "./calendar-utils";

type Deadline = Parameters<typeof toCalendarEvent>[0];

const utcDay = (offset: number) => {
	const now = new Date();

	return new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + offset,
		),
	);
};

const deadline = (
	id: string,
	offset: number,
	priority: Deadline["priority"],
	projectId = "p-a",
	completedAt: Date | null = null,
): Deadline => ({
	id,
	title: `Task ${id}`,
	projectId,
	projectName: "Project A",
	projectSlug: "project-a",
	projectColor: "#7C3AED",
	dueDate: utcDay(offset),
	completedAt,
	priority,
});

const FIXTURE: Deadline[] = [
	deadline("a", 0, "high"),
	deadline("b", 1, "medium", "p-b"),
	deadline("c", 1, "low"),
	deadline("d", 5, "high", "p-b"),
	deadline("e", 20, "low"),
];

describe("toCalendarEvent", () => {
	it("projects the UTC calendar day onto local midnight", () => {
		const event = toCalendarEvent({
			...FIXTURE[0],
			dueDate: new Date(Date.UTC(2026, 7, 18)),
		});

		expect(event.start.getFullYear()).toBe(2026);
		expect(event.start.getMonth()).toBe(7);
		expect(event.start.getDate()).toBe(18);
		expect(event.start.getHours()).toBe(0);
		expect(event.allDay).toBe(true);
	});

	it("keeps the grid cell on the same day the UTC date prints", () => {
		for (const item of FIXTURE) {
			const event = toCalendarEvent(item);

			expect(event.start.getDate()).toBe(item.dueDate.getUTCDate());
			expect(event.start.getMonth()).toBe(item.dueDate.getUTCMonth());
		}
	});
});

describe("filterDeadlines", () => {
	it("returns everything when both filters are all", () => {
		expect(filterDeadlines(FIXTURE, "all", "all")).toHaveLength(5);
	});

	it("filters by priority", () => {
		expect(filterDeadlines(FIXTURE, "high", "all").map((d) => d.id)).toEqual([
			"a",
			"d",
		]);
	});

	it("filters by project", () => {
		expect(filterDeadlines(FIXTURE, "all", "p-b").map((d) => d.id)).toEqual([
			"b",
			"d",
		]);
	});

	it("combines both filters", () => {
		expect(filterDeadlines(FIXTURE, "high", "p-b").map((d) => d.id)).toEqual([
			"d",
		]);
	});
});

describe("getUpcomingDeadlines", () => {
	it("drops anything past the 14 day window and sorts by date", () => {
		expect(getUpcomingDeadlines(FIXTURE).map((d) => d.id)).toEqual([
			"a",
			"b",
			"c",
			"d",
		]);
	});

	it("excludes overdue deadlines", () => {
		expect(getUpcomingDeadlines([deadline("past", -1, "high")])).toHaveLength(
			0,
		);
	});

	it("includes the boundary day", () => {
		expect(getUpcomingDeadlines([deadline("edge", 14, "low")])).toHaveLength(1);
	});

	it("treats a null anchor as today", () => {
		expect(getUpcomingDeadlines(FIXTURE, null).map((d) => d.id)).toEqual(
			getUpcomingDeadlines(FIXTURE).map((d) => d.id),
		);
	});

	it("anchors the window on a picked date", () => {
		const now = new Date();

		const anchor = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 5,
		);

		// "d" is 5 days out, "e" is 20 — from day 5 the window covers days 5..19,
		// so "d" stays, the earlier three drop out, and "e" is still beyond it.
		expect(getUpcomingDeadlines(FIXTURE, anchor).map((d) => d.id)).toEqual([
			"d",
		]);
	});

	it("brings far-future deadlines into range once anchored", () => {
		const now = new Date();

		const anchor = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 10,
		);

		expect(getUpcomingDeadlines(FIXTURE, anchor).map((d) => d.id)).toEqual([
			"e",
		]);
	});

	it("excludes deadlines before the anchor", () => {
		const now = new Date();

		const anchor = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 2,
		);

		const ids = getUpcomingDeadlines(FIXTURE, anchor).map((d) => d.id);

		expect(ids).not.toContain("a");
		expect(ids).not.toContain("b");
		expect(ids).not.toContain("c");
	});

	it("excludes completed deadlines", () => {
		const done = deadline("done", 2, "high", "p-a", new Date());

		expect(getUpcomingDeadlines([done])).toHaveLength(0);
		expect(getUpcomingDeadlines([...FIXTURE, done]).map((d) => d.id)).toEqual([
			"a",
			"b",
			"c",
			"d",
		]);
	});
});

describe("toCalendarDay", () => {
	it("agrees with the date formatProjectDate prints", () => {
		for (const item of FIXTURE) {
			const day = toCalendarDay(item.dueDate);

			expect(formatProjectDate(item.dueDate)).toContain(String(day.getDate()));
		}
	});

	it("reads the UTC calendar day, matching how Drizzle returns timestamps", () => {
		const day = toCalendarDay(new Date(Date.UTC(2026, 7, 18)));

		expect(day.getFullYear()).toBe(2026);
		expect(day.getMonth()).toBe(7);
		expect(day.getDate()).toBe(18);
		expect(day.getHours()).toBe(0);
	});
});

describe("isCompleted", () => {
	it("is true only when completedAt is set", () => {
		expect(isCompleted(deadline("open", 1, "low"))).toBe(false);
		expect(isCompleted(deadline("done", 1, "low", "p-a", new Date()))).toBe(
			true,
		);
	});
});

describe("groupDeadlinesByDay", () => {
	it("labels the first two buckets Today and Tomorrow", () => {
		const groups = groupDeadlinesByDay(getUpcomingDeadlines(FIXTURE));

		expect(groups[0].label).toBe("Today");
		expect(groups[1].label).toBe("Tomorrow");
		expect(groups[2].label).not.toMatch(/Today|Tomorrow/);
	});

	it("buckets same-day deadlines together", () => {
		const groups = groupDeadlinesByDay(FIXTURE);

		expect(groups[1].deadlines.map((d) => d.id)).toEqual(["b", "c"]);
	});

	it("preserves every deadline exactly once", () => {
		const flat = groupDeadlinesByDay(FIXTURE).flatMap((g) => g.deadlines);

		expect(flat).toHaveLength(FIXTURE.length);
		expect(new Set(flat.map((d) => d.id)).size).toBe(FIXTURE.length);
	});
});

describe("countByPriority", () => {
	it("counts high, medium and low in that order", () => {
		expect(countByPriority(FIXTURE)).toEqual([
			{ priority: "high", total: 2 },
			{ priority: "medium", total: 1 },
			{ priority: "low", total: 2 },
		]);
	});

	it("reports zeroes for an empty list", () => {
		expect(countByPriority([]).every((entry) => entry.total === 0)).toBe(true);
	});
});

describe("addDays", () => {
	it("steps forward and back", () => {
		const base = new Date(2026, 7, 19);

		expect(addDays(base, 1).getDate()).toBe(20);
		expect(addDays(base, -1).getDate()).toBe(18);
	});

	it("normalises to midnight", () => {
		const stamped = new Date(2026, 7, 19, 15, 42, 8);

		const result = addDays(stamped, 0);

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
	});

	it("rolls across month and year boundaries", () => {
		const endOfMonth = addDays(new Date(2026, 7, 31), 1);

		expect(endOfMonth.getMonth()).toBe(8);
		expect(endOfMonth.getDate()).toBe(1);

		const endOfYear = addDays(new Date(2026, 11, 31), 1);

		expect(endOfYear.getFullYear()).toBe(2027);
		expect(endOfYear.getMonth()).toBe(0);
	});

	it("does not mutate its argument", () => {
		const base = new Date(2026, 7, 19);

		addDays(base, 5);

		expect(base.getDate()).toBe(19);
	});

	it("steps a week when the week view navigates", () => {
		const start = startOfWeekLocal(new Date(2026, 7, 19));

		expect(addDays(start, 7).getDate()).toBe(23);
		expect(addDays(start, -7).getDate()).toBe(9);
	});
});

describe("week helpers", () => {
	it("startOfWeekLocal lands on Sunday at midnight", () => {
		const start = startOfWeekLocal(new Date(2026, 7, 19));

		expect(start.getDay()).toBe(0);
		expect(start.getDate()).toBe(16);
		expect(start.getHours()).toBe(0);
	});

	it("getWeekRange spans Sunday through Saturday", () => {
		const range = getWeekRange(new Date(2026, 7, 19));

		expect(range).toHaveLength(7);
		expect(range[0].getDay()).toBe(0);
		expect(range[6].getDay()).toBe(6);
		expect(range[6].getDate()).toBe(22);
	});

	it("getWeekRange crosses month boundaries", () => {
		const range = getWeekRange(new Date(2026, 7, 31));

		expect(range[0].getMonth()).toBe(7);
		expect(range[6].getMonth()).toBe(8);
	});

	it("isSameLocalDay ignores the time of day", () => {
		expect(
			isSameLocalDay(
				new Date(2026, 7, 19, 0, 0),
				new Date(2026, 7, 19, 23, 59),
			),
		).toBe(true);

		expect(isSameLocalDay(new Date(2026, 7, 19), new Date(2026, 7, 20))).toBe(
			false,
		);
	});
});
