import { describe, expect, it } from "vitest";
import { RANK_COLORS, UNRANKED_COLOR } from "../constants";
import { getBarPercent, getRankColor } from "./rank";

describe("getRankColor", () => {
	it("gives each of the top five ranks its own colour", () => {
		const colors = [0, 1, 2, 3, 4].map(getRankColor);

		expect(new Set(colors).size).toBe(5);
		expect(colors).toEqual([...RANK_COLORS]);
	});

	it("mutes every rank past the fifth", () => {
		expect(getRankColor(5)).toBe(UNRANKED_COLOR);
		expect(getRankColor(99)).toBe(UNRANKED_COLOR);
	});

	it("never returns a dark-only chart token", () => {
		const colors = [0, 1, 2, 3, 4, 5].map(getRankColor);

		expect(colors.some((color) => /--chart-[678]/.test(color))).toBe(false);
	});
});

describe("getBarPercent", () => {
	it("fills the bar for the top scorer", () => {
		expect(getBarPercent(12, 12)).toBe(100);
	});

	it("scales the rest against the top scorer", () => {
		expect(getBarPercent(6, 12)).toBe(50);
		expect(getBarPercent(9, 12)).toBe(75);
	});

	it("returns zero rather than NaN when nobody completed anything", () => {
		expect(getBarPercent(0, 0)).toBe(0);
	});

	it("returns zero for a member with no completions", () => {
		expect(getBarPercent(0, 12)).toBe(0);
	});
});
