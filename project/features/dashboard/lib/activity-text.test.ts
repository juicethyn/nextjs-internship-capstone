import { describe, expect, it } from "vitest";
import { activityPhrase, activityTitle } from "./activity-text";

describe("activityPhrase", () => {
	it("maps known entity/action pairs", () => {
		expect(activityPhrase("created", "task")).toBe("created a task");
		expect(activityPhrase("completed", "task")).toBe("completed a task");
		expect(activityPhrase("archived", "project")).toBe("archived the project");
		expect(activityPhrase("created", "project_member")).toBe("added a member");
	});

	it("falls back for pairs no call site emits", () => {
		expect(activityPhrase("joined", "workspace_member")).toBe(
			"joined workspace member",
		);
	});

	it("never returns an empty string", () => {
		expect(activityPhrase("restored", "comment").length).toBeGreaterThan(0);
	});
});

describe("activityTitle", () => {
	it("reads the per-entity title key", () => {
		expect(activityTitle({ title: "Fix login" })).toBe("Fix login");
		expect(activityTitle({ taskTitle: "Ship v2" })).toBe("Ship v2");
		expect(activityTitle({ name: "In Progress" })).toBe("In Progress");
	});

	it("prefers title over the other keys", () => {
		expect(activityTitle({ name: "list", title: "task" })).toBe("task");
	});

	it("returns null for missing or unusable metadata", () => {
		expect(activityTitle(null)).toBeNull();
		expect(activityTitle(undefined)).toBeNull();
		expect(activityTitle({})).toBeNull();
		expect(activityTitle({ userId: "abc" })).toBeNull();
	});

	it("ignores non-string and blank values", () => {
		expect(activityTitle({ title: 42 })).toBeNull();
		expect(activityTitle({ title: "   " })).toBeNull();
	});

	it("survives arrays and primitives", () => {
		expect(activityTitle(["title"])).toBeNull();
		expect(activityTitle("title")).toBeNull();
	});
});
