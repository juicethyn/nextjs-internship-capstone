import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createProjectSchema,
	projectGeneralSettingsSchema,
	updateProjectSchema,
} from "@/lib/validations/project";

type ParseResult = {
	success: boolean;
	error?: {
		issues: readonly { message: string; path: readonly PropertyKey[] }[];
	};
};

const firstIssue = (result: ParseResult) => result.error?.issues[0] ?? null;

const NOW = new Date("2026-08-25T12:00:00.000Z");

const startOfToday = () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return today;
};

const valid = {
	name: "Apollo",
	color: "#1A2B3C",
};

const LABEL_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("createProjectSchema name and description", () => {
	it("accepts a minimal valid project", () => {
		expect(createProjectSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects an empty name", () => {
		const result = createProjectSchema.safeParse({ ...valid, name: "" });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Name is required");
	});

	it("rejects a name over one hundred characters", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			name: "A".repeat(101),
		});

		expect(firstIssue(result)?.message).toBe("Name too long");
	});

	it("accepts a name at exactly one hundred characters", () => {
		expect(
			createProjectSchema.safeParse({ ...valid, name: "A".repeat(100) })
				.success,
		).toBe(true);
	});

	it("rejects a description over five hundred characters", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			description: "A".repeat(501),
		});

		expect(firstIssue(result)?.message).toBe("Description too long");
	});

	it("accepts a description at exactly five hundred characters", () => {
		expect(
			createProjectSchema.safeParse({
				...valid,
				description: "A".repeat(500),
			}).success,
		).toBe(true);
	});
});

describe("createProjectSchema color", () => {
	it("accepts both the three and six digit hex forms", () => {
		expect(
			createProjectSchema.safeParse({ ...valid, color: "#fff" }).success,
		).toBe(true);

		expect(
			createProjectSchema.safeParse({ ...valid, color: "#ffffff" }).success,
		).toBe(true);
	});

	it("rejects a malformed colour", () => {
		const result = createProjectSchema.safeParse({ ...valid, color: "fff" });

		expect(firstIssue(result)?.message).toBe("Invalid color");
	});
});

describe("createProjectSchema optional dates", () => {
	it("turns an empty string into undefined", () => {
		const result = createProjectSchema.safeParse({ ...valid, startDate: "" });

		expect(result.success).toBe(true);
		expect(result.data?.startDate).toBeUndefined();
	});

	it("coerces an ISO string into a Date", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			startDate: "2027-01-15T00:00:00.000Z",
		});

		expect(result.success).toBe(true);
		expect(result.data?.startDate).toBeInstanceOf(Date);
		expect(result.data?.startDate?.toISOString()).toBe(
			"2027-01-15T00:00:00.000Z",
		);
	});

	it("leaves an omitted date undefined", () => {
		const result = createProjectSchema.safeParse(valid);

		expect(result.data?.startDate).toBeUndefined();
		expect(result.data?.dueDate).toBeUndefined();
	});
});

describe("createProjectSchema due date", () => {
	it("accepts a due date in the future", () => {
		expect(
			createProjectSchema.safeParse({
				...valid,
				dueDate: "2027-01-01T00:00:00.000Z",
			}).success,
		).toBe(true);
	});

	it("accepts the start of today, so today still counts as future", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			dueDate: startOfToday().toISOString(),
		});

		expect(result.success).toBe(true);
	});

	it("rejects one millisecond before the start of today", () => {
		const justBefore = new Date(startOfToday().getTime() - 1);

		const result = createProjectSchema.safeParse({
			...valid,
			dueDate: justBefore.toISOString(),
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Due date must be in the future");
	});

	it("rejects a clearly past due date", () => {
		expect(
			createProjectSchema.safeParse({
				...valid,
				dueDate: "2020-01-01T00:00:00.000Z",
			}).success,
		).toBe(false);
	});

	it("does not check that the due date follows the start date", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			startDate: "2027-06-01T00:00:00.000Z",
			dueDate: "2027-01-01T00:00:00.000Z",
		});

		expect(result.success).toBe(true);
	});
});

describe("createProjectSchema labelIds", () => {
	it("defaults to an empty array when omitted", () => {
		const result = createProjectSchema.safeParse(valid);

		expect(result.data?.labelIds).toEqual([]);
	});

	it("accepts a list of uuids", () => {
		const result = createProjectSchema.safeParse({
			...valid,
			labelIds: [LABEL_ID],
		});

		expect(result.data?.labelIds).toEqual([LABEL_ID]);
	});

	it("rejects an entry that is not a uuid", () => {
		expect(
			createProjectSchema.safeParse({ ...valid, labelIds: ["nope"] }).success,
		).toBe(false);
	});
});

describe("updateProjectSchema", () => {
	it("accepts an empty object", () => {
		expect(updateProjectSchema.safeParse({}).success).toBe(true);
	});

	it("accepts a single field on its own", () => {
		expect(updateProjectSchema.safeParse({ name: "Renamed" }).success).toBe(
			true,
		);
	});

	it("still applies the due date refinement when a due date is present", () => {
		const result = updateProjectSchema.safeParse({
			dueDate: "2020-01-01T00:00:00.000Z",
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Due date must be in the future");
	});
});

describe("projectGeneralSettingsSchema", () => {
	it("accepts a settings payload without dates", () => {
		expect(projectGeneralSettingsSchema.safeParse(valid).success).toBe(true);
	});

	it("rejects a due date before the start date", () => {
		const result = projectGeneralSettingsSchema.safeParse({
			...valid,
			startDate: new Date("2027-06-01T00:00:00.000Z"),
			dueDate: new Date("2027-01-01T00:00:00.000Z"),
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe(
			"Due date must be on or after the start date",
		);
		expect(firstIssue(result)?.path).toEqual(["dueDate"]);
	});

	it("accepts a due date equal to the start date", () => {
		const sameDay = new Date("2027-01-01T00:00:00.000Z");

		expect(
			projectGeneralSettingsSchema.safeParse({
				...valid,
				startDate: sameDay,
				dueDate: sameDay,
			}).success,
		).toBe(true);
	});

	it("accepts a due date after the start date", () => {
		expect(
			projectGeneralSettingsSchema.safeParse({
				...valid,
				startDate: new Date("2027-01-01T00:00:00.000Z"),
				dueDate: new Date("2027-06-01T00:00:00.000Z"),
			}).success,
		).toBe(true);
	});

	it("skips the ordering check when either date is missing", () => {
		expect(
			projectGeneralSettingsSchema.safeParse({
				...valid,
				dueDate: new Date("2020-01-01T00:00:00.000Z"),
			}).success,
		).toBe(true);

		expect(
			projectGeneralSettingsSchema.safeParse({
				...valid,
				startDate: new Date("2027-06-01T00:00:00.000Z"),
			}).success,
		).toBe(true);
	});

	it("does not apply the future due date rule that creating a project does", () => {
		expect(
			projectGeneralSettingsSchema.safeParse({
				...valid,
				dueDate: new Date("2020-01-01T00:00:00.000Z"),
			}).success,
		).toBe(true);
	});
});
