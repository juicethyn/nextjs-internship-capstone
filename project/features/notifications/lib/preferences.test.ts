import { describe, expect, it } from "vitest";
import { notificationTypes } from "../../../lib/db/types";
import { isNotificationAllowed, NOTIFICATION_CATEGORY } from "./preferences";

describe("isNotificationAllowed", () => {
	it("allows everything when preferences are unknown", () => {
		expect(isNotificationAllowed(undefined, "task_assigned")).toBe(true);
	});

	it("allows everything on a default profile", () => {
		const preferences = {
			notificationsMuted: false,
			mutedNotificationCategories: [],
		};

		for (const type of notificationTypes) {
			expect(isNotificationAllowed(preferences, type)).toBe(true);
		}
	});

	it("blocks every type when muted entirely", () => {
		const preferences = {
			notificationsMuted: true,
			mutedNotificationCategories: [],
		};

		for (const type of notificationTypes) {
			expect(isNotificationAllowed(preferences, type)).toBe(false);
		}
	});

	it("blocks only the muted category", () => {
		const preferences = {
			notificationsMuted: false,
			mutedNotificationCategories: ["task" as const],
		};

		expect(isNotificationAllowed(preferences, "task_assigned")).toBe(false);
		expect(isNotificationAllowed(preferences, "task_completed")).toBe(false);
		expect(isNotificationAllowed(preferences, "workspace_role_changed")).toBe(
			true,
		);
		expect(isNotificationAllowed(preferences, "project_member_added")).toBe(
			true,
		);
	});

	it("blocks several muted categories at once", () => {
		const preferences = {
			notificationsMuted: false,
			mutedNotificationCategories: ["workspace" as const, "project" as const],
		};

		expect(isNotificationAllowed(preferences, "workspace_member_joined")).toBe(
			false,
		);
		expect(isNotificationAllowed(preferences, "project_lead_assigned")).toBe(
			false,
		);
		expect(isNotificationAllowed(preferences, "task_assigned")).toBe(true);
	});

	it("categorises every notification type", () => {
		for (const type of notificationTypes) {
			expect(NOTIFICATION_CATEGORY[type]).toBeDefined();
		}
	});
});
