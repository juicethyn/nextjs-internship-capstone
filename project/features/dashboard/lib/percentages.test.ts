import { describe, expect, it } from "vitest";
import { distributePercentages } from "./percentages";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

describe("distributePercentages", () => {
	it("keeps an even three-way split at exactly 100", () => {
		const result = distributePercentages([1, 1, 1]);

		expect(sum(result)).toBe(100);
		expect(result).toEqual([34, 33, 33]);
	});

	it("handles exact percentages without adjustment", () => {
		expect(distributePercentages([50, 30, 20])).toEqual([50, 30, 20]);
	});

	it("returns zeros when there is nothing to divide", () => {
		expect(distributePercentages([0, 0, 0])).toEqual([0, 0, 0]);
	});

	it("gives everything to a single non-zero bucket", () => {
		expect(distributePercentages([0, 7, 0])).toEqual([0, 100, 0]);
	});

	it("always totals 100 across awkward splits", () => {
		const cases = [
			[1, 1, 1],
			[7, 8, 7],
			[1, 2, 3],
			[22, 0, 0],
			[5, 5, 1],
			[9, 9, 9],
			[1, 1, 1, 1, 1, 1],
		];

		for (const values of cases) {
			expect(sum(distributePercentages(values))).toBe(100);
		}
	});

	it("never awards a share to an empty bucket", () => {
		const result = distributePercentages([0, 10, 5]);

		expect(result[0]).toBe(0);
		expect(sum(result)).toBe(100);
	});

	it("gives the leftover to the largest remainder", () => {
		expect(distributePercentages([1, 1, 4])).toEqual([17, 17, 66]);
	});
});
