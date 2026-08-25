import { describe, expect, it } from "vitest";
import { getProjectTaskStats } from "@/features/projects/lib/project-stats";
import type { ListType } from "@/lib/db/types";

type StatsLists = Parameters<typeof getProjectTaskStats>[0];

const list = (type: ListType, taskCount: number) => ({
	type,
	tasks: Array.from({ length: taskCount }, (_, index) => ({
		id: `${type}-${index}`,
	})),
});

const board = (...entries: ReturnType<typeof list>[]) =>
	entries as unknown as StatsLists;

describe("getProjectTaskStats", () => {
	it("returns zeros for a project with no lists", () => {
		expect(getProjectTaskStats(board())).toEqual({
			totalTasks: 0,
			completedTasks: 0,
			progress: 0,
		});
	});

	it("returns zeros when lists exist but hold no tasks", () => {
		const stats = getProjectTaskStats(
			board(list("todo", 0), list("in_progress", 0), list("done", 0)),
		);

		expect(stats).toEqual({
			totalTasks: 0,
			completedTasks: 0,
			progress: 0,
		});
	});

	it("counts every task across every list", () => {
		const stats = getProjectTaskStats(
			board(list("todo", 2), list("in_progress", 3), list("done", 1)),
		);

		expect(stats.totalTasks).toBe(6);
	});

	it("only counts done lists as completed", () => {
		const stats = getProjectTaskStats(
			board(list("todo", 5), list("in_progress", 4), list("done", 1)),
		);

		expect(stats.completedTasks).toBe(1);
	});

	it("aggregates multiple done lists", () => {
		const stats = getProjectTaskStats(
			board(list("done", 2), list("done", 3), list("todo", 5)),
		);

		expect(stats.completedTasks).toBe(5);
		expect(stats.totalTasks).toBe(10);
		expect(stats.progress).toBe(50);
	});

	it("reports full progress when everything is done", () => {
		const stats = getProjectTaskStats(board(list("done", 4)));

		expect(stats.progress).toBe(100);
	});

	it("reports no progress when nothing is done", () => {
		const stats = getProjectTaskStats(
			board(list("todo", 3), list("in_progress", 1)),
		);

		expect(stats.progress).toBe(0);
		expect(stats.totalTasks).toBe(4);
	});

	it("rounds progress rather than truncating it", () => {
		expect(
			getProjectTaskStats(board(list("done", 1), list("todo", 2))).progress,
		).toBe(33);

		expect(
			getProjectTaskStats(board(list("done", 2), list("todo", 1))).progress,
		).toBe(67);
	});

	it("never reports progress outside zero to one hundred", () => {
		const cases = [
			board(list("done", 1), list("todo", 99)),
			board(list("done", 99), list("todo", 1)),
			board(list("done", 1)),
			board(list("todo", 1)),
		];

		for (const lists of cases) {
			const { progress } = getProjectTaskStats(lists);

			expect(progress).toBeGreaterThanOrEqual(0);
			expect(progress).toBeLessThanOrEqual(100);
		}
	});
});
