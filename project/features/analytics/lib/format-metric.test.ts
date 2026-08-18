import { describe, expect, it } from "vitest";
import {
	EMPTY_METRIC,
	formatDelta,
	formatMetricValue,
	formatPercent,
} from "./format-metric";

describe("formatMetricValue", () => {
	it("pins the value to the requested precision", () => {
		expect(formatMetricValue(4.234, 1)).toBe("4.2");
		expect(formatMetricValue(4, 1)).toBe("4.0");
		expect(formatMetricValue(23.6, 0)).toBe("24");
	});

	it("renders a dash when there is nothing to average", () => {
		expect(formatMetricValue(null, 1)).toBe(EMPTY_METRIC);
	});

	it("keeps a real zero distinct from no data", () => {
		expect(formatMetricValue(0, 1)).toBe("0.0");
	});
});

describe("formatPercent", () => {
	it("rounds and appends a percent sign", () => {
		expect(formatPercent(91.6)).toBe("92%");
		expect(formatPercent(0)).toBe("0%");
	});

	it("renders a dash when no tasks were created", () => {
		expect(formatPercent(null)).toBe(EMPTY_METRIC);
	});
});

describe("formatDelta", () => {
	it("marks a rise as up and signs it", () => {
		expect(formatDelta(4.2, 3.6, 1)).toEqual({
			label: "+0.6 last period",
			sign: "up",
		});
	});

	it("marks a fall as down and signs it", () => {
		expect(formatDelta(3.6, 4.0, 1)).toEqual({
			label: "-0.4 last period",
			sign: "down",
		});
	});

	it("reports a flat period instead of a signed zero", () => {
		expect(formatDelta(4.2, 4.2, 1)).toEqual({
			label: "No change from last period",
			sign: "flat",
		});
	});

	it("treats a difference below the displayed precision as flat", () => {
		expect(formatDelta(4.21, 4.19, 1)).toEqual({
			label: "No change from last period",
			sign: "flat",
		});
	});

	it("appends the suffix directly after the magnitude", () => {
		expect(formatDelta(92, 88, 0, "%")).toEqual({
			label: "+4% last period",
			sign: "up",
		});
	});

	it("returns nothing when either side has no data", () => {
		expect(formatDelta(null, 3.6, 1)).toBeNull();
		expect(formatDelta(4.2, null, 1)).toBeNull();
		expect(formatDelta(null, null, 1)).toBeNull();
	});
});
