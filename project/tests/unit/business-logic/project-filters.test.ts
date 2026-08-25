import { describe, expect, it } from "vitest";
import type { ProjectListItem } from "@/features/projects/lib/project-filters";
import { sortProjectItems } from "@/features/projects/lib/project-filters";

type ItemInput = {
	name: string;
	status: "active" | "completed" | "archived";
	progress?: number;
	dueDate?: Date | null;
};

function item({
	name,
	status,
	progress = 0,
	dueDate = null,
}: ItemInput): ProjectListItem {
	return {
		project: { name, status, dueDate } as ProjectListItem["project"],
		stats: { progress } as ProjectListItem["stats"],
	};
}

const names = (items: ProjectListItem[]) =>
	items.map((entry) => entry.project.name);

describe("sortProjectItems", () => {
	it("keeps archived last when sorting by progress", () => {
		const items = [
			item({ name: "Legacy App", status: "archived", progress: 100 }),
			item({ name: "Website", status: "active", progress: 90 }),
			item({ name: "API", status: "active", progress: 60 }),
		];

		expect(names(sortProjectItems(items, "progress"))).toEqual([
			"Website",
			"API",
			"Legacy App",
		]);
	});

	it("keeps archived last when sorting by name", () => {
		const items = [
			item({ name: "Alpha", status: "archived" }),
			item({ name: "Zulu", status: "active" }),
		];

		expect(names(sortProjectItems(items, "name"))).toEqual(["Zulu", "Alpha"]);
	});

	it("keeps archived last when sorting by due date", () => {
		const items = [
			item({
				name: "Legacy App",
				status: "archived",
				dueDate: new Date("2020-01-01"),
			}),
			item({
				name: "Website",
				status: "active",
				dueDate: new Date("2030-01-01"),
			}),
		];

		expect(names(sortProjectItems(items, "dueDate"))).toEqual([
			"Website",
			"Legacy App",
		]);
	});

	it("still orders archived projects among themselves", () => {
		const items = [
			item({ name: "Beta", status: "archived", progress: 10 }),
			item({ name: "Alpha", status: "archived", progress: 80 }),
			item({ name: "Website", status: "active", progress: 50 }),
		];

		expect(names(sortProjectItems(items, "progress"))).toEqual([
			"Website",
			"Alpha",
			"Beta",
		]);
	});

	it("leaves active and completed interleaved by the sort key", () => {
		const items = [
			item({ name: "API", status: "active", progress: 60 }),
			item({ name: "Mobile", status: "completed", progress: 75 }),
			item({ name: "Website", status: "active", progress: 90 }),
		];

		expect(names(sortProjectItems(items, "progress"))).toEqual([
			"Website",
			"Mobile",
			"API",
		]);
	});

	it("does not mutate the input array", () => {
		const items = [
			item({ name: "Legacy App", status: "archived" }),
			item({ name: "Website", status: "active" }),
		];

		sortProjectItems(items, "name");

		expect(names(items)).toEqual(["Legacy App", "Website"]);
	});
});
