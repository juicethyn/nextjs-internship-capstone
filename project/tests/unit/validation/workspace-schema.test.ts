import { describe, expect, it } from "vitest";
import {
	createWorkspaceSchema,
	updateWorkspaceSchema,
	workspaceGeneralSettingsSchema,
} from "@/lib/validations/workspace";

type ParseResult = {
	success: boolean;
	error?: {
		issues: readonly { message: string; path: readonly PropertyKey[] }[];
	};
};

const firstIssue = (result: ParseResult) => result.error?.issues[0] ?? null;

const valid = {
	name: "Fora",
	color: "#1A2B3C",
};

describe("createWorkspaceSchema name", () => {
	it("accepts a valid workspace", () => {
		const result = createWorkspaceSchema.safeParse(valid);

		expect(result.success).toBe(true);
	});

	it("rejects a name shorter than two characters", () => {
		const result = createWorkspaceSchema.safeParse({ ...valid, name: "F" });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe(
			"Workspace name must be at least 2 characters",
		);
	});

	it("rejects a name longer than fifty characters", () => {
		const result = createWorkspaceSchema.safeParse({
			...valid,
			name: "F".repeat(51),
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe(
			"Workspace name must be less than 50 characters",
		);
	});

	it("accepts the exact length boundaries", () => {
		expect(
			createWorkspaceSchema.safeParse({ ...valid, name: "Fo" }).success,
		).toBe(true);

		expect(
			createWorkspaceSchema.safeParse({ ...valid, name: "F".repeat(50) })
				.success,
		).toBe(true);
	});

	it("requires a name to be present", () => {
		const result = createWorkspaceSchema.safeParse({ color: valid.color });

		expect(result.success).toBe(false);
	});
});

describe("createWorkspaceSchema color", () => {
	it("accepts a six digit hex colour in either case", () => {
		expect(
			createWorkspaceSchema.safeParse({ ...valid, color: "#1A2B3C" }).success,
		).toBe(true);

		expect(
			createWorkspaceSchema.safeParse({ ...valid, color: "#aabbcc" }).success,
		).toBe(true);
	});

	it("rejects the three digit shorthand that projects and labels allow", () => {
		const result = createWorkspaceSchema.safeParse({
			...valid,
			color: "#fff",
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Invalid workspace color");
	});

	it("rejects a colour without a leading hash", () => {
		expect(
			createWorkspaceSchema.safeParse({ ...valid, color: "1A2B3C" }).success,
		).toBe(false);
	});

	it("rejects a non hexadecimal character", () => {
		expect(
			createWorkspaceSchema.safeParse({ ...valid, color: "#12345G" }).success,
		).toBe(false);
	});

	it("requires a colour to be present", () => {
		expect(createWorkspaceSchema.safeParse({ name: valid.name }).success).toBe(
			false,
		);
	});
});

describe("createWorkspaceSchema logoUrl", () => {
	it("is optional", () => {
		expect(createWorkspaceSchema.safeParse(valid).success).toBe(true);
	});

	it("accepts a valid url", () => {
		expect(
			createWorkspaceSchema.safeParse({
				...valid,
				logoUrl: "https://fora.dev/logo.png",
			}).success,
		).toBe(true);
	});

	it("rejects a malformed url", () => {
		const result = createWorkspaceSchema.safeParse({
			...valid,
			logoUrl: "not-a-url",
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Invalid logo URL");
	});
});

describe("updateWorkspaceSchema", () => {
	it("accepts an empty object, which would issue a no-op update", () => {
		const result = updateWorkspaceSchema.safeParse({});

		expect(result.success).toBe(true);
	});

	it("accepts a single field on its own", () => {
		expect(updateWorkspaceSchema.safeParse({ name: "Renamed" }).success).toBe(
			true,
		);

		expect(
			updateWorkspaceSchema.safeParse({ setupCompleted: true }).success,
		).toBe(true);
	});

	it("still validates the fields that are present", () => {
		expect(updateWorkspaceSchema.safeParse({ name: "F" }).success).toBe(false);
		expect(updateWorkspaceSchema.safeParse({ color: "#fff" }).success).toBe(
			false,
		);
	});
});

describe("workspaceGeneralSettingsSchema", () => {
	it("requires both name and colour", () => {
		expect(workspaceGeneralSettingsSchema.safeParse({}).success).toBe(false);

		expect(
			workspaceGeneralSettingsSchema.safeParse({ name: "Fora" }).success,
		).toBe(false);

		expect(
			workspaceGeneralSettingsSchema.safeParse({ color: "#1A2B3C" }).success,
		).toBe(false);
	});

	it("accepts a complete settings payload", () => {
		expect(workspaceGeneralSettingsSchema.safeParse(valid).success).toBe(true);
	});

	it("inherits the create schema error messages", () => {
		const result = workspaceGeneralSettingsSchema.safeParse({
			...valid,
			name: "F",
		});

		expect(firstIssue(result)?.message).toBe(
			"Workspace name must be at least 2 characters",
		);
	});

	it("strips logoUrl rather than rejecting it", () => {
		const result = workspaceGeneralSettingsSchema.safeParse({
			...valid,
			logoUrl: "https://fora.dev/logo.png",
		});

		expect(result.success).toBe(true);
		expect(result.data).toEqual(valid);
	});
});
