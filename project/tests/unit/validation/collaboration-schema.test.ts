import { describe, expect, it } from "vitest";
import { invitationStatus, workspaceMemberRoles } from "@/lib/db/types";
import {
	createCommentSchema,
	updateCommentSchema,
} from "@/lib/validations/comment";
import { addProjectMembersSchema } from "@/lib/validations/projectMember";
import {
	createWorkspaceInvitationSchema,
	updateWorkspaceInvitationSchema,
} from "@/lib/validations/workspaceInvitation";

type ParseResult = {
	success: boolean;
	error?: {
		issues: readonly { message: string; path: readonly PropertyKey[] }[];
	};
};

const firstIssue = (result: ParseResult) => result.error?.issues[0] ?? null;

const uuidAt = (index: number) =>
	`00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

describe("createCommentSchema", () => {
	it("accepts ordinary content", () => {
		expect(
			createCommentSchema.safeParse({ content: "Looks good" }).success,
		).toBe(true);
	});

	it("rejects empty content", () => {
		const result = createCommentSchema.safeParse({ content: "" });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Content is required");
	});

	it("rejects content over one thousand characters", () => {
		const result = createCommentSchema.safeParse({
			content: "A".repeat(1001),
		});

		expect(firstIssue(result)?.message).toBe("Content too long");
	});

	it("accepts content at exactly one thousand characters", () => {
		expect(
			createCommentSchema.safeParse({ content: "A".repeat(1000) }).success,
		).toBe(true);
	});

	it("accepts whitespace only content, which callers trim before submitting", () => {
		expect(createCommentSchema.safeParse({ content: "   " }).success).toBe(
			true,
		);
	});

	it("requires content to be present", () => {
		expect(createCommentSchema.safeParse({}).success).toBe(false);
	});
});

describe("updateCommentSchema", () => {
	it("accepts an empty object", () => {
		expect(updateCommentSchema.safeParse({}).success).toBe(true);
	});

	it("still validates content that is present", () => {
		expect(updateCommentSchema.safeParse({ content: "" }).success).toBe(false);
	});
});

describe("createWorkspaceInvitationSchema", () => {
	it("accepts a valid invitation", () => {
		expect(
			createWorkspaceInvitationSchema.safeParse({
				email: "teammate@fora.dev",
				role: "member",
			}).success,
		).toBe(true);
	});

	it("rejects a malformed email", () => {
		const result = createWorkspaceInvitationSchema.safeParse({
			email: "nope",
			role: "member",
		});

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Invalid email address");
	});

	it("rejects an empty email", () => {
		expect(
			createWorkspaceInvitationSchema.safeParse({ email: "", role: "member" })
				.success,
		).toBe(false);
	});

	it("rejects an unknown role", () => {
		expect(
			createWorkspaceInvitationSchema.safeParse({
				email: "teammate@fora.dev",
				role: "guest",
			}).success,
		).toBe(false);
	});

	it("stays in step with the workspace member roles it duplicates", () => {
		for (const role of workspaceMemberRoles) {
			expect(
				createWorkspaceInvitationSchema.safeParse({
					email: "teammate@fora.dev",
					role,
				}).success,
			).toBe(true);
		}
	});

	it("requires both fields", () => {
		expect(
			createWorkspaceInvitationSchema.safeParse({ email: "a@fora.dev" })
				.success,
		).toBe(false);

		expect(
			createWorkspaceInvitationSchema.safeParse({ role: "member" }).success,
		).toBe(false);
	});
});

describe("updateWorkspaceInvitationSchema", () => {
	it("accepts an empty object", () => {
		expect(updateWorkspaceInvitationSchema.safeParse({}).success).toBe(true);
	});

	it("accepts every invitation status", () => {
		for (const status of invitationStatus) {
			expect(
				updateWorkspaceInvitationSchema.safeParse({ status }).success,
			).toBe(true);
		}
	});

	it("rejects an unknown status", () => {
		expect(
			updateWorkspaceInvitationSchema.safeParse({ status: "cancelled" })
				.success,
		).toBe(false);
	});

	it("accepts an expiry date", () => {
		expect(
			updateWorkspaceInvitationSchema.safeParse({
				expiresAt: new Date("2027-01-01T00:00:00.000Z"),
			}).success,
		).toBe(true);
	});

	it("rejects an expiry that is not a Date", () => {
		expect(
			updateWorkspaceInvitationSchema.safeParse({
				expiresAt: "2027-01-01T00:00:00.000Z",
			}).success,
		).toBe(false);
	});
});

describe("addProjectMembersSchema", () => {
	it("accepts a single member", () => {
		expect(
			addProjectMembersSchema.safeParse({ userIds: [uuidAt(1)] }).success,
		).toBe(true);
	});

	it("rejects an empty selection", () => {
		const result = addProjectMembersSchema.safeParse({ userIds: [] });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe("Select at least one member");
	});

	it("accepts exactly fifty members", () => {
		const userIds = Array.from({ length: 50 }, (_, index) => uuidAt(index));

		expect(addProjectMembersSchema.safeParse({ userIds }).success).toBe(true);
	});

	it("rejects fifty one members", () => {
		const userIds = Array.from({ length: 51 }, (_, index) => uuidAt(index));

		const result = addProjectMembersSchema.safeParse({ userIds });

		expect(result.success).toBe(false);
		expect(firstIssue(result)?.message).toBe(
			"Too many members selected at once",
		);
	});

	it("rejects an entry that is not a uuid", () => {
		expect(
			addProjectMembersSchema.safeParse({ userIds: ["user-1"] }).success,
		).toBe(false);
	});

	it("requires the userIds field", () => {
		expect(addProjectMembersSchema.safeParse({}).success).toBe(false);
	});
});
