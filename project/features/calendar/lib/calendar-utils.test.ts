import { describe, expect, it } from "vitest";
import {
	addDays,
	combineDateAndTime,
	countByPriority,
	filterDeadlines,
	formatCalendarDay,
	getUpcomingDeadlines,
	getWeekRange,
	groupDeadlinesByDay,
	isCompleted,
	isSameLocalDay,
	startOfWeekLocal,
	toCalendarDay,
	toTaskItem,
} from "./calendar-utils";

type Deadline = Parameters<typeof toTaskItem>[0];

const dayFromToday = (offset: number) => {
	const now = new Date();

	return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
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
	dueDate: dayFromToday(offset),
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

describe("toTaskItem", () => {
	it("normalises a due date to local midnight of its own day", () => {
		const item = toTaskItem({
			...FIXTURE[0],
			dueDate: new Date(2026, 7, 18, 16, 45),
		});

		expect(item.start.getFullYear()).toBe(2026);
		expect(item.start.getMonth()).toBe(7);
		expect(item.start.getDate()).toBe(18);
		expect(item.start.getHours()).toBe(0);
		expect(item.allDay).toBe(true);
		expect(item.kind).toBe("task");
	});

	it("places every deadline on the day it was picked for", () => {
		for (const deadlineRow of FIXTURE) {
			const item = toTaskItem(deadlineRow);

			expect(item.start.getDate()).toBe(deadlineRow.dueDate.getDate());
			expect(item.start.getMonth()).toBe(deadlineRow.dueDate.getMonth());
		}
	});
});

describe("timestamp round trip", () => {
	it("preserves the picked wall clock through a Drizzle-style round trip", () => {
		const picked = combineDateAndTime(new Date(2026, 7, 19), "14:30");

		const roundTripped = new Date(picked.getTime());

		expect(roundTripped.getHours()).toBe(14);
		expect(roundTripped.getMinutes()).toBe(30);
		expect(roundTripped.getDate()).toBe(19);
	});

	it("keeps a DatePicker date on its picked day", () => {
		const picked = new Date(2026, 7, 19);

		const day = toCalendarDay(new Date(picked.getTime()));

		expect(day.getDate()).toBe(19);
		expect(day.getMonth()).toBe(7);
		expect(day.getHours()).toBe(0);
	});
});

describe("combineDateAndTime", () => {
	it("merges a picked date with a time input value", () => {
		const result = combineDateAndTime(new Date(2026, 7, 19), "09:05");

		expect(result.getDate()).toBe(19);
		expect(result.getHours()).toBe(9);
		expect(result.getMinutes()).toBe(5);
	});

	it("handles midnight and end of day", () => {
		expect(combineDateAndTime(new Date(2026, 7, 19), "00:00").getHours()).toBe(
			0,
		);

		const endOfDay = combineDateAndTime(new Date(2026, 7, 19), "23:59");

		expect(endOfDay.getHours()).toBe(23);
		expect(endOfDay.getMinutes()).toBe(59);
	});

	it("falls back to midnight on a malformed value", () => {
		const result = combineDateAndTime(new Date(2026, 7, 19), "");

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
	});

	it("does not mutate the date it was given", () => {
		const base = new Date(2026, 7, 19);

		combineDateAndTime(base, "18:45");

		expect(base.getHours()).toBe(0);
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
	it("agrees with the label the sidebar groups under", () => {
		for (const item of FIXTURE) {
			const day = toCalendarDay(item.dueDate);

			expect(formatCalendarDay(item.dueDate)).toContain(String(day.getDate()));
		}
	});

	it("strips the time without shifting the day", () => {
		const day = toCalendarDay(new Date(2026, 7, 18, 23, 59));

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
