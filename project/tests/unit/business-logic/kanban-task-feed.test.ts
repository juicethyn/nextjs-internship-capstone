import { describe, expect, it } from "vitest";
import { mergeTaskFeed } from "@/features/projects/kanban/lib/task-feed";

const comment = (id: string, iso: string) => ({ id, createdAt: new Date(iso) });
const activity = (id: string, iso: string) => ({
	id,
	createdAt: new Date(iso),
});

const ids = (entries: { id: string }[]) => entries.map((entry) => entry.id);

describe("mergeTaskFeed", () => {
	it("returns only comments when activity is hidden", () => {
		const result = mergeTaskFeed(
			[comment("c1", "2026-01-01T10:00:00Z")],
			[activity("a1", "2026-01-01T09:00:00Z")],
			false,
		);

		expect(ids(result)).toEqual(["c1"]);
	});

	it("interleaves activity and comments by time", () => {
		const result = mergeTaskFeed(
			[
				comment("c1", "2026-01-01T10:00:00Z"),
				comment("c2", "2026-01-01T14:00:00Z"),
			],
			[
				activity("a1", "2026-01-01T09:00:00Z"),
				activity("a2", "2026-01-01T12:00:00Z"),
			],
			true,
		);

		expect(ids(result)).toEqual(["a1", "c1", "a2", "c2"]);
	});

	it("tags each entry with its kind", () => {
		const result = mergeTaskFeed(
			[comment("c1", "2026-01-01T10:00:00Z")],
			[activity("a1", "2026-01-01T09:00:00Z")],
			true,
		);

		expect(result.map((entry) => entry.kind)).toEqual(["activity", "comment"]);
	});

	it("accepts serialized timestamps", () => {
		const result = mergeTaskFeed(
			[{ id: "c1", createdAt: "2026-01-01T10:00:00Z" }],
			[{ id: "a1", createdAt: "2026-01-01T09:00:00Z" }],
			true,
		);

		expect(ids(result)).toEqual(["a1", "c1"]);
	});

	it("handles empty inputs", () => {
		expect(mergeTaskFeed([], [], true)).toEqual([]);
	});

	it("does not mutate the inputs", () => {
		const comments = [
			comment("c2", "2026-01-01T14:00:00Z"),
			comment("c1", "2026-01-01T10:00:00Z"),
		];

		mergeTaskFeed(comments, [], true);

		expect(ids(comments)).toEqual(["c2", "c1"]);
	});
});
