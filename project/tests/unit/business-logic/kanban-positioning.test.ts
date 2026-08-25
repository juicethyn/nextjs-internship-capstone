import { describe, expect, it } from "vitest";
import {
	buildRebalancedPositions,
	calculatePosition,
	needsRebalance,
	POSITION_STEP,
} from "@/lib/positioning";

describe("calculatePosition", () => {
	it("seeds the first card in an empty list", () => {
		expect(calculatePosition()).toBe(POSITION_STEP);
		expect(calculatePosition(undefined, undefined)).toBe(1000);
	});

	it("halves the next position when dropped at the top", () => {
		expect(calculatePosition(undefined, 2000)).toBe(1000);
		expect(calculatePosition(undefined, 500)).toBe(250);
	});

	it("steps past the previous position when dropped at the bottom", () => {
		expect(calculatePosition(3000)).toBe(4000);
		expect(calculatePosition(3000, undefined)).toBe(4000);
	});

	it("takes the midpoint when dropped between two cards", () => {
		expect(calculatePosition(1000, 2000)).toBe(1500);
		expect(calculatePosition(1000, 1001)).toBe(1000.5);
	});

	it("treats a zero neighbour as present, not missing", () => {
		expect(calculatePosition(0, 1000)).toBe(500);
		expect(calculatePosition(0, undefined)).toBe(1000);
	});

	it("always lands strictly between its neighbours", () => {
		const pairs = [
			[1000, 2000],
			[0, 1],
			[999.5, 999.75],
			[-500, 500],
		];

		for (const [prev, next] of pairs) {
			const position = calculatePosition(prev, next);

			expect(position).toBeGreaterThan(prev);
			expect(position).toBeLessThan(next);
		}
	});
});

describe("needsRebalance", () => {
	it("never fires when a neighbour is missing", () => {
		expect(needsRebalance()).toBe(false);
		expect(needsRebalance(undefined, 1000)).toBe(false);
		expect(needsRebalance(1000, undefined)).toBe(false);
	});

	it("fires only once the gap drops below the minimum", () => {
		expect(needsRebalance(1000, 1000.0005)).toBe(true);
		expect(needsRebalance(1000, 1000.002)).toBe(false);
		expect(needsRebalance(1000, 1001)).toBe(false);
	});

	it("does not fire on an exact minimum gap", () => {
		expect(needsRebalance(0, 0.001)).toBe(false);
	});

	it("treats a gap of one thousandth at scale as too small", () => {
		expect(Math.abs(1000.001 - 1000)).toBeLessThan(0.001);
		expect(needsRebalance(1000, 1000.001)).toBe(true);
	});

	it("ignores the order of the two neighbours", () => {
		expect(needsRebalance(1000.0005, 1000)).toBe(true);
		expect(needsRebalance(1001, 1000)).toBe(false);
	});

	it("fires when two cards share a position", () => {
		expect(needsRebalance(1000, 1000)).toBe(true);
	});

	it("eventually fires after repeated midpoint inserts", () => {
		const next = 2000;
		let prev = 1000;
		let inserts = 0;

		while (!needsRebalance(prev, next) && inserts < 100) {
			prev = calculatePosition(prev, next);
			inserts += 1;
		}

		expect(needsRebalance(prev, next)).toBe(true);
		expect(inserts).toBeLessThan(100);
	});
});

describe("buildRebalancedPositions", () => {
	it("spaces positions evenly from one step", () => {
		expect(buildRebalancedPositions(3)).toEqual([1000, 2000, 3000]);
	});

	it("returns nothing for an empty list", () => {
		expect(buildRebalancedPositions(0)).toEqual([]);
	});

	it("returns one position per card", () => {
		expect(buildRebalancedPositions(7)).toHaveLength(7);
	});

	it("produces gaps wide enough that no rebalance is flagged", () => {
		const positions = buildRebalancedPositions(10);

		for (let index = 1; index < positions.length; index += 1) {
			expect(positions[index]).toBeGreaterThan(positions[index - 1]);
			expect(needsRebalance(positions[index - 1], positions[index])).toBe(
				false,
			);
		}
	});
});
