import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, type Page } from "@playwright/test";
import { e2eEnv } from "../support/env";

export class SignInPage {
	constructor(private readonly page: Page) {}

	private get identifierInput() {
		return this.page.locator('input[name="identifier"]');
	}

	private get passwordInput() {
		return this.page.locator('input[name="password"]');
	}

	private get codeInput() {
		return this.page
			.getByRole("textbox", { name: /verification code/i })
			.first();
	}

	private get continueButton() {
		return this.page.getByRole("button", { name: "Continue", exact: true });
	}

	async goto() {
		await setupClerkTestingToken({ page: this.page });
		await this.page.goto("/sign-in");
		await expect(this.identifierInput).toBeVisible();
	}

	async signIn() {
		await this.identifierInput.fill(e2eEnv.email);
		await this.continueButton.click();

		await expect(this.passwordInput.or(this.codeInput).first()).toBeVisible();

		if (await this.isVisible(this.passwordInput)) {
			await this.passwordInput.fill(e2eEnv.password);
			await this.continueButton.click();
		}

		await this.submitVerificationCode();
		await this.settleAfterSignIn();
	}

	private async settleAfterSignIn() {
		await this.page.waitForURL(/\/(onboarding|w\/)/, { timeout: 30_000 });
	}

	private async submitVerificationCode() {
		try {
			await this.codeInput.waitFor({ state: "visible", timeout: 15_000 });
		} catch {
			return;
		}

		await this.codeInput.click();
		await this.codeInput.pressSequentially(e2eEnv.verificationCode, {
			delay: 60,
		});

		if (await this.isVisible(this.continueButton)) {
			await this.continueButton
				.click({ timeout: 5_000 })
				.catch(() => undefined);
		}
	}

	private async isVisible(locator: ReturnType<Page["locator"]>) {
		return locator.isVisible().catch(() => false);
	}
}
