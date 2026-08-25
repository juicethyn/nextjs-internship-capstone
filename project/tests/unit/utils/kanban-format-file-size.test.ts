import { describe, expect, it } from "vitest";
import { formatFileSize } from "@/features/projects/kanban/lib/format-file-size";

describe("formatFileSize", () => {
	it("shows raw bytes below a kilobyte", () => {
		expect(formatFileSize(0)).toBe("0 B");
		expect(formatFileSize(512)).toBe("512 B");
		expect(formatFileSize(1023)).toBe("1023 B");
	});

	it("switches to kilobytes at exactly 1024", () => {
		expect(formatFileSize(1024)).toBe("1 KB");
	});

	it("rounds kilobytes to whole numbers", () => {
		expect(formatFileSize(1536)).toBe("2 KB");
		expect(formatFileSize(20_000)).toBe("20 KB");
	});

	it("switches to megabytes at exactly 1048576", () => {
		expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
	});

	it("shows one decimal place for megabytes", () => {
		expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
		expect(formatFileSize(1024 * 1024 * 16)).toBe("16.0 MB");
	});

	it("returns an empty string for nonsense input", () => {
		expect(formatFileSize(-1)).toBe("");
		expect(formatFileSize(Number.NaN)).toBe("");
	});
});
