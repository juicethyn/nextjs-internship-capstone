import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listTypes } from "@/lib/db/types";
import { createListSchema, updateListSchema } from "@/lib/validations/list";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task";

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

const ASSIGNEE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const validTask = {
	title: "Ship the board",
};

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("createListSchema", () => {
	it("accepts a list with just a name", () => {
		expect(createListSchema.safeParse({ name: "Backlog" }).success).toBe(true);
	});

	it("rejects an empty name", () => {
		const result = createListSchema.safeParse({ name: "" });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Name is required");
	});

	it("rejects a name over one hundred characters", () => {
		const result = createListSchema.safeParse({ name: "A".repeat(101) });

		expect(firstIssue(result)?.message).toBe("Name too long");
	});

	it("accepts the creatable list types", () => {
		expect(
			createListSchema.safeParse({ name: "Backlog", type: "todo" }).success,
		).toBe(true);

		expect(
			createListSchema.safeParse({ name: "Doing", type: "in_progress" })
				.success,
		).toBe(true);
	});

	it("rejects the done type, which only the system may create", () => {
		expect(listTypes).toContain("done");

		expect(
			createListSchema.safeParse({ name: "Done", type: "done" }).success,
		).toBe(false);
	});

	it("rejects an unknown type", () => {
		expect(
			createListSchema.safeParse({ name: "Backlog", type: "archived" }).success,
		).toBe(false);
	});
});

describe("updateListSchema", () => {
	it("accepts an empty object", () => {
		expect(updateListSchema.safeParse({}).success).toBe(true);
	});

	it("still rejects the done type", () => {
		expect(updateListSchema.safeParse({ type: "done" }).success).toBe(false);
	});
});

describe("createTaskSchema title", () => {
	it("accepts a minimal task", () => {
		expect(createTaskSchema.safeParse(validTask).success).toBe(true);
	});

	it("rejects an empty title", () => {
		const result = createTaskSchema.safeParse({ title: "" });

		expect(firstIssue(result)?.message).toBe("Title is required");
	});

	it("rejects a title over two hundred characters", () => {
		const result = createTaskSchema.safeParse({ title: "A".repeat(201) });

		expect(firstIssue(result)?.message).toBe("Title too long");
	});

	it("accepts a title at exactly two hundred characters", () => {
		expect(createTaskSchema.safeParse({ title: "A".repeat(200) }).success).toBe(
			true,
		);
	});
});

describe("createTaskSchema priority", () => {
	it("defaults to none when omitted", () => {
		const result = createTaskSchema.safeParse(validTask);

		expect(result.data?.priority).toBe("none");
	});

	it("accepts every supported priority", () => {
		for (const priority of ["none", "low", "medium", "high"]) {
			expect(
				createTaskSchema.safeParse({ ...validTask, priority }).success,
			).toBe(true);
		}
	});

	it("rejects an unknown priority", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, priority: "urgent" }).success,
		).toBe(false);
	});
});

describe("createTaskSchema description", () => {
	it("accepts a rich text document object", () => {
		expect(
			createTaskSchema.safeParse({
				...validTask,
				description: { type: "doc", content: [] },
			}).success,
		).toBe(true);
	});

	it("accepts null and undefined", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, description: null }).success,
		).toBe(true);

		expect(
			createTaskSchema.safeParse({ ...validTask, description: undefined })
				.success,
		).toBe(true);
	});

	it("rejects an array", () => {
		const result = createTaskSchema.safeParse({
			...validTask,
			description: [],
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Invalid description");
	});

	it("rejects primitives", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, description: "text" }).success,
		).toBe(false);

		expect(
			createTaskSchema.safeParse({ ...validTask, description: 42 }).success,
		).toBe(false);
	});

	it("rejects a document that serialises past the length cap", () => {
		const result = createTaskSchema.safeParse({
			...validTask,
			description: { type: "doc", text: "a".repeat(100_001) },
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Description too long");
	});
});

describe("createTaskSchema assignee", () => {
	it("accepts a uuid", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, assigneeId: ASSIGNEE_ID })
				.success,
		).toBe(true);
	});

	it("accepts null for an unassigned task", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, assigneeId: null }).success,
		).toBe(true);
	});

	it("rejects a non uuid", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, assigneeId: "user-1" })
				.success,
		).toBe(false);
	});
});

describe("createTaskSchema dates", () => {
	it("coerces ISO strings into Dates", () => {
		const result = createTaskSchema.safeParse({
			...validTask,
			startDate: "2027-01-01T00:00:00.000Z",
			dueDate: "2027-02-01T00:00:00.000Z",
		});

		expect(result.data?.startDate).toBeInstanceOf(Date);
		expect(result.data?.dueDate).toBeInstanceOf(Date);
	});

	it("accepts the start of today as a due date", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, dueDate: startOfToday() })
				.success,
		).toBe(true);
	});

	it("rejects one millisecond before the start of today", () => {
		const justBefore = new Date(startOfToday().getTime() - 1);

		const result = createTaskSchema.safeParse({
			...validTask,
			dueDate: justBefore,
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Due date must be in the future");
		expect(firstIssue(result)?.path).toEqual(["dueDate"]);
	});

	it("skips the future check when there is no due date", () => {
		expect(
			createTaskSchema.safeParse({ ...validTask, dueDate: null }).success,
		).toBe(true);
	});
});

describe("updateTaskSchema", () => {
	it("accepts an empty object", () => {
		expect(updateTaskSchema.safeParse({}).success).toBe(true);
	});

	it("accepts a single field on its own", () => {
		expect(updateTaskSchema.safeParse({ title: "Renamed" }).success).toBe(true);
	});

	it("still validates the fields that are present", () => {
		expect(updateTaskSchema.safeParse({ title: "" }).success).toBe(false);
		expect(updateTaskSchema.safeParse({ priority: "urgent" }).success).toBe(
			false,
		);
	});

	it("accepts a past due date that creating a task would reject", () => {
		const pastDueDate = new Date("2020-01-01T00:00:00.000Z");

		expect(
			createTaskSchema.safeParse({ ...validTask, dueDate: pastDueDate })
				.success,
		).toBe(false);

		expect(updateTaskSchema.safeParse({ dueDate: pastDueDate }).success).toBe(
			true,
		);
	});
});
