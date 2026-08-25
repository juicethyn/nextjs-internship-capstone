import { describe, expect, it } from "vitest";
import {
	filterMembersBySearch,
	getInitials,
	memberDisplayName,
} from "@/lib/user-display";

const user = (firstName: string, lastName: string, email: string) => ({
	firstName,
	lastName,
	email,
});

const member = (firstName: string, lastName: string, email: string) => ({
	user: user(firstName, lastName, email),
});

describe("memberDisplayName", () => {
	it("joins the first and last name", () => {
		expect(memberDisplayName(user("Juzzthyn", "Perez", "jp@fora.dev"))).toBe(
			"Juzzthyn Perez",
		);
	});

	it("uses the first name alone without a trailing space", () => {
		expect(memberDisplayName(user("Juzzthyn", "", "jp@fora.dev"))).toBe(
			"Juzzthyn",
		);
	});

	it("uses the last name alone without a leading space", () => {
		expect(memberDisplayName(user("", "Perez", "jp@fora.dev"))).toBe("Perez");
	});

	it("falls back to the email when both names are empty", () => {
		expect(memberDisplayName(user("", "", "jp@fora.dev"))).toBe("jp@fora.dev");
	});

	it("falls back to the email when both names are only whitespace", () => {
		expect(memberDisplayName(user("  ", " ", "jp@fora.dev"))).toBe(
			"jp@fora.dev",
		);
	});
});

describe("getInitials", () => {
	it("takes the first letter of each name", () => {
		expect(getInitials("Juzzthyn", "Perez")).toBe("JP");
	});

	it("uppercases lowercase names", () => {
		expect(getInitials("juzzthyn", "perez")).toBe("JP");
	});

	it("returns a single initial when one name is missing", () => {
		expect(getInitials("Juzzthyn", "")).toBe("J");
		expect(getInitials("", "Perez")).toBe("P");
	});

	it("returns an empty string rather than throwing on two empty names", () => {
		expect(getInitials("", "")).toBe("");
	});
});

describe("filterMembersBySearch", () => {
	const members = [
		member("Juzzthyn", "Perez", "jp@fora.dev"),
		member("Ada", "Lovelace", "ada@fora.dev"),
		member("", "", "ghost@fora.dev"),
	];

	it("returns the original array when the search is empty", () => {
		expect(filterMembersBySearch(members, "")).toBe(members);
	});

	it("returns the original array when the search is only whitespace", () => {
		expect(filterMembersBySearch(members, "   ")).toBe(members);
	});

	it("matches on the display name", () => {
		const result = filterMembersBySearch(members, "Lovelace");

		expect(result).toHaveLength(1);
		expect(result[0].user.email).toBe("ada@fora.dev");
	});

	it("matches case-insensitively", () => {
		expect(filterMembersBySearch(members, "JUZZTHYN")).toHaveLength(1);
		expect(filterMembersBySearch(members, "ada")).toHaveLength(1);
	});

	it("trims the search term before matching", () => {
		expect(filterMembersBySearch(members, "  Perez  ")).toHaveLength(1);
	});

	it("matches on the email when the name does not", () => {
		const result = filterMembersBySearch(members, "ghost");

		expect(result).toHaveLength(1);
		expect(result[0].user.email).toBe("ghost@fora.dev");
	});

	it("matches a shared email domain across every member", () => {
		expect(filterMembersBySearch(members, "fora.dev")).toHaveLength(3);
	});

	it("returns an empty array when nothing matches", () => {
		expect(filterMembersBySearch(members, "nobody")).toEqual([]);
	});

	it("does not mutate the input array", () => {
		filterMembersBySearch(members, "Ada");

		expect(members).toHaveLength(3);
	});
});
