import { expect, type Page } from "@playwright/test";

export class OnboardingPage {
	constructor(private readonly page: Page) {}

	stepIndicator(step: number) {
		return this.page.getByText(`Step ${step} of 3`);
	}

	async expectOnStep(step: number) {
		await expect(this.stepIndicator(step)).toBeVisible();
	}

	async expectWorkspaceStep() {
		await expect(
			this.page.getByRole("heading", { name: "Name your workspace" }),
		).toBeVisible();
		await this.expectOnStep(1);
	}

	async createWorkspace(name: string) {
		const input = this.page.locator("#workspace-name");

		await expect(input).toBeVisible();
		await input.fill(name);

		const continueButton = this.page.getByRole("button", { name: "Continue" });

		await expect(continueButton).toBeEnabled();
		await continueButton.click();
	}

	async expectInviteStep(workspaceName: string) {
		await expect(
			this.page.getByRole("heading", { name: "Invite your team" }),
		).toBeVisible();
		await this.expectOnStep(2);
		await expect(
			this.page.getByText(workspaceName, { exact: false }),
		).toBeVisible();
	}

	async skipInvites() {
		await this.page.getByRole("button", { name: "Skip for now" }).click();
	}

	async expectProfileStep() {
		await expect(
			this.page.getByRole("heading", { name: "Tell us about yourself" }),
		).toBeVisible();
		await this.expectOnStep(3);
	}

	async selectOccupation(label: string) {
		await this.page.getByRole("combobox").click();
		await this.page.getByRole("option", { name: label, exact: true }).click();
		await expect(this.page.getByRole("combobox")).toContainText(label);
	}

	async finish() {
		const submit = this.page.getByRole("button", { name: "Create workspace" });

		await expect(submit).toBeEnabled();
		await submit.click();
	}
}
