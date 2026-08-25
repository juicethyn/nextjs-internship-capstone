import { expect, type Page } from "@playwright/test";

export class ProjectsPage {
	constructor(private readonly page: Page) {}

	async gotoFromSidebar() {
		await this.page
			.getByRole("link", { name: "Projects", exact: true })
			.click();
		await expect(this.page).toHaveURL(/\/w\/[^/]+\/projects$/);
		await expect(
			this.page.getByRole("heading", { name: "Browse Projects" }),
		).toBeVisible();
	}

	async openCreateDialog() {
		await this.page
			.getByRole("button", { name: "New Project", exact: true })
			.first()
			.click();

		await expect(
			this.page.getByRole("heading", { name: "Create Project" }),
		).toBeVisible();
	}

	async createProject(name: string) {
		const dialog = this.page.getByRole("dialog");

		await dialog.locator("#name").fill(name);

		const submit = dialog.getByRole("button", { name: "Create Project" });

		await expect(submit).toBeEnabled();
		await submit.click();
	}

	projectLink(name: string) {
		return this.page.getByRole("link", { name: new RegExp(name) });
	}
}
