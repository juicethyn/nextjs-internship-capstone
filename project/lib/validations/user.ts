import z from "zod";
import { occupationEnum } from "../db/schema";
import { notificationCategories } from "../db/types";

export const profileSettingsSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "First name is required")
		.max(50, "First name too long"),
	lastName: z
		.string()
		.trim()
		.min(1, "Last name is required")
		.max(50, "Last name too long"),
	occupation: z.enum(occupationEnum.enumValues),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

const passwordFormBase = z.object({
	currentPassword: z.string(),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(72, "Password too long"),
	confirmPassword: z.string(),
	signOutOfOtherSessions: z.boolean(),
});

export type PasswordFormInput = z.infer<typeof passwordFormBase>;

export const setPasswordSchema = passwordFormBase.refine(
	(data) => data.newPassword === data.confirmPassword,
	{ message: "Passwords do not match", path: ["confirmPassword"] },
);

export const changePasswordSchema = passwordFormBase
	.refine((data) => data.currentPassword.length > 0, {
		message: "Current password is required",
		path: ["currentPassword"],
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: "New password must be different",
		path: ["newPassword"],
	});

export const changeEmailSchema = z.object({
	email: z.email("Enter a valid email address"),
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const emailCodeSchema = z.object({
	code: z.string().trim().length(6, "Enter the 6-digit code"),
});

export type EmailCodeInput = z.infer<typeof emailCodeSchema>;

export const notificationSettingsSchema = z.object({
	notificationsMuted: z.boolean(),
	mutedNotificationCategories: z.array(z.enum(notificationCategories)),
});

export type NotificationSettingsInput = z.infer<
	typeof notificationSettingsSchema
>;

export const updateUserSchema = z
	.object({
		firstName: z
			.string()
			.min(1, "First name is required")
			.max(50, "First name too long"),
		lastName: z
			.string()
			.min(1, "Last name is required")
			.max(50, "Last name too long"),
		email: z.email("Invalid email").optional(),
		imageUrl: z.url("Invalid image URL").optional(),
		occupation: z.enum([
			"software_engineer",
			"product_manager",
			"designer",
			"qa_engineer",
			"devops_engineer",
			"student",
			"other",
		]),
		lastWorkspaceId: z.uuid("Invalid workspace ID").nullable().optional(),
		currentWorkspaceId: z.uuid("Invalid workspace ID").nullable().optional(),
		notificationsMuted: z.boolean().optional(),
		mutedNotificationCategories: z
			.array(z.enum(notificationCategories))
			.optional(),
	})
	.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
