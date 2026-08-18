import { describe, expect, it } from "vitest";
import { getLabelMaxChars, truncateLabel } from "./chart-label";

describe("getLabelMaxChars", () => {
	it("gives more room when there are fewer bars", () => {
		expect(getLabelMaxChars(3)).toBe(18);
		expect(getLabelMaxChars(5)).toBe(14);
		expect(getLabelMaxChars(8)).toBe(10);
	});

	it("never widens past the crowded allowance", () => {
		expect(getLabelMaxChars(20)).toBe(10);
	});
});

describe("truncateLabel", () => {
	it("leaves a short label alone", () => {
		expect(truncateLabel("Fora", 10)).toBe("Fora");
	});

	it("leaves a label sitting exactly on the limit alone", () => {
		expect(truncateLabel("Marketing!", 10)).toBe("Marketing!");
	});

	it("clips a long label and marks it with an ellipsis", () => {
		expect(truncateLabel("Freshwater Fish Thesis", 10)).toBe("Freshwate…");
	});

	it("does not leave a dangling space before the ellipsis", () => {
		expect(truncateLabel("Fora Mobile App", 6)).toBe("Fora…");
	});

	it("survives a maxChars of one", () => {
		expect(truncateLabel("Marketing", 1)).toBe("M…");
	});
});
