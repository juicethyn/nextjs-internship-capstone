import { describe, expect, it } from "vitest";
import {
	canManageWorkspaceMember,
	WORKSPACE_MEMBER_FORBIDDEN_MESSAGE,
} from "@/features/members/lib/member-permissions";
import type { WorkspaceMemberRole } from "@/lib/db/types";
import { workspaceMemberRoles } from "@/lib/db/types";

const MATRIX: [WorkspaceMemberRole, WorkspaceMemberRole, boolean][] = [
	["owner", "owner", false],
	["owner", "admin", true],
	["owner", "member", true],
	["admin", "owner", false],
	["admin", "admin", false],
	["admin", "member", true],
	["member", "owner", false],
	["member", "admin", false],
	["member", "member", false],
];

describe("canManageWorkspaceMember matrix", () => {
	it("covers every viewer and target role pair", () => {
		expect(MATRIX).toHaveLength(workspaceMemberRoles.length ** 2);
	});

	it.each(MATRIX)(
		"a %s viewing a %s resolves to %s",
		(viewerRole, targetRole, allowed) => {
			expect(canManageWorkspaceMember(viewerRole, targetRole, false)).toBe(
				allowed,
			);
		},
	);

	it.each(MATRIX)(
		"a %s viewing a %s is denied when it is themselves",
		(viewerRole, targetRole) => {
			expect(canManageWorkspaceMember(viewerRole, targetRole, true)).toBe(
				false,
			);
		},
	);
});

describe("canManageWorkspaceMember rules", () => {
	it("stops anyone from managing themselves, owners included", () => {
		expect(canManageWorkspaceMember("owner", "owner", true)).toBe(false);
		expect(canManageWorkspaceMember("admin", "admin", true)).toBe(false);
		expect(canManageWorkspaceMember("member", "member", true)).toBe(false);
	});

	it("protects owners from every other role", () => {
		for (const viewerRole of workspaceMemberRoles) {
			expect(canManageWorkspaceMember(viewerRole, "owner", false)).toBe(false);
		}
	});

	it("lets an owner manage admins and members", () => {
		expect(canManageWorkspaceMember("owner", "admin", false)).toBe(true);
		expect(canManageWorkspaceMember("owner", "member", false)).toBe(true);
	});

	it("lets an admin manage members but not other admins", () => {
		expect(canManageWorkspaceMember("admin", "member", false)).toBe(true);
		expect(canManageWorkspaceMember("admin", "admin", false)).toBe(false);
	});

	it("gives a plain member no authority at all", () => {
		for (const targetRole of workspaceMemberRoles) {
			expect(canManageWorkspaceMember("member", targetRole, false)).toBe(false);
		}
	});
});

describe("WORKSPACE_MEMBER_FORBIDDEN_MESSAGE", () => {
	it("carries the copy the server action returns on denial", () => {
		expect(WORKSPACE_MEMBER_FORBIDDEN_MESSAGE).toBe(
			"You do not have permission to manage this member.",
		);
	});
});
