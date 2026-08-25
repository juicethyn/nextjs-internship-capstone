import { describe, expect, it } from "vitest";
import {
	DEFAULT_TASK_SORT,
	PRIORITY_RANK,
	sortTasks,
	TASK_SORT_OPTIONS,
} from "@/features/projects/kanban/lib/task-sort";
import type { TaskPriority } from "@/lib/db/types";

type TestTask = {
	id: string;
	title: string;
	priority: TaskPriority;
	position: number;
	dueDate: Date | null;
	createdAt: Date;
};

const task = (
	id: string,
	overrides: Partial<Omit<TestTask, "id">> = {},
): TestTask => ({
	id,
	title: id,
	priority: "none",
	position: 0,
	dueDate: null,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	...overrides,
});

const ids = (tasks: TestTask[]) => tasks.map((item) => item.id);

describe("sortTasks manual", () => {
	it("orders by ascending position", () => {
		const tasks = [
			task("c", { position: 3000 }),
			task("a", { position: 1000 }),
			task("b", { position: 2000 }),
		];

		expect(ids(sortTasks(tasks, "manual"))).toEqual(["a", "b", "c"]);
	});

	it("ignores every other field", () => {
		const tasks = [
			task("second", { position: 2000, priority: "high" }),
			task("first", { position: 1000, priority: "none" }),
		];

		expect(ids(sortTasks(tasks, "manual"))).toEqual(["first", "second"]);
	});
});

describe("sortTasks priority", () => {
	it("ranks high above medium above low above none", () => {
		const tasks = [
			task("none", { priority: "none" }),
			task("high", { priority: "high" }),
			task("low", { priority: "low" }),
			task("medium", { priority: "medium" }),
		];

		expect(ids(sortTasks(tasks, "priority"))).toEqual([
			"high",
			"medium",
			"low",
			"none",
		]);
	});

	it("exposes a rank for every priority", () => {
		expect(PRIORITY_RANK).toEqual({ high: 3, medium: 2, low: 1, none: 0 });
	});

	it("breaks a priority tie on title", () => {
		const tasks = [
			task("zebra", { priority: "high", title: "Zebra", position: 1000 }),
			task("alpha", { priority: "high", title: "Alpha", position: 2000 }),
		];

		expect(ids(sortTasks(tasks, "priority"))).toEqual(["alpha", "zebra"]);
	});
});

describe("sortTasks dueDate", () => {
	it("puts the earliest due date first", () => {
		const tasks = [
			task("march", { dueDate: new Date("2026-03-01T00:00:00.000Z") }),
			task("january", { dueDate: new Date("2026-01-01T00:00:00.000Z") }),
			task("february", { dueDate: new Date("2026-02-01T00:00:00.000Z") }),
		];

		expect(ids(sortTasks(tasks, "dueDate"))).toEqual([
			"january",
			"february",
			"march",
		]);
	});

	it("sinks tasks with no due date to the bottom", () => {
		const dated = task("dated", {
			dueDate: new Date("2026-05-01T00:00:00.000Z"),
		});
		const undated = task("undated");

		expect(ids(sortTasks([undated, dated], "dueDate"))).toEqual([
			"dated",
			"undated",
		]);
		expect(ids(sortTasks([dated, undated], "dueDate"))).toEqual([
			"dated",
			"undated",
		]);
	});

	it("falls back to title when both due dates are missing", () => {
		const tasks = [
			task("b", { title: "Beta", position: 1000 }),
			task("a", { title: "Alpha", position: 2000 }),
		];

		expect(ids(sortTasks(tasks, "dueDate"))).toEqual(["a", "b"]);
	});
});

describe("sortTasks createdAt", () => {
	it("puts the newest task first", () => {
		const tasks = [
			task("january", { createdAt: new Date("2026-01-01T00:00:00.000Z") }),
			task("march", { createdAt: new Date("2026-03-01T00:00:00.000Z") }),
			task("february", { createdAt: new Date("2026-02-01T00:00:00.000Z") }),
		];

		expect(ids(sortTasks(tasks, "createdAt"))).toEqual([
			"march",
			"february",
			"january",
		]);
	});
});

describe("sortTasks tie-breaking", () => {
	it("treats titles as equal regardless of case, then uses position", () => {
		const tasks = [
			task("lower", { title: "apple", position: 5000 }),
			task("upper", { title: "Apple", position: 1000 }),
		];

		expect(ids(sortTasks(tasks, "title"))).toEqual(["upper", "lower"]);
	});
});

describe("sortTasks contract", () => {
	it("does not mutate the input array", () => {
		const tasks = [
			task("c", { position: 3000 }),
			task("a", { position: 1000 }),
			task("b", { position: 2000 }),
		];

		sortTasks(tasks, "manual");

		expect(ids(tasks)).toEqual(["c", "a", "b"]);
	});

	it("returns a new array", () => {
		const tasks = [task("a")];

		expect(sortTasks(tasks, "manual")).not.toBe(tasks);
	});

	it("handles an empty list for every sort key", () => {
		for (const option of TASK_SORT_OPTIONS) {
			expect(sortTasks([] as TestTask[], option.value)).toEqual([]);
		}
	});

	it("keeps every task for every sort key", () => {
		const tasks = [
			task("a", { position: 2000, priority: "low" }),
			task("b", { position: 1000, priority: "high" }),
		];

		for (const option of TASK_SORT_OPTIONS) {
			expect(sortTasks(tasks, option.value)).toHaveLength(2);
		}
	});

	it("defaults to manual ordering", () => {
		expect(DEFAULT_TASK_SORT).toBe("manual");
		expect(TASK_SORT_OPTIONS.map((option) => option.value)).toContain(
			DEFAULT_TASK_SORT,
		);
	});
});
