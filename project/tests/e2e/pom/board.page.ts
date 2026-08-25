import { expect, type Page } from "@playwright/test";

export class BoardPage {
	constructor(private readonly page: Page) {}

	column(listName: string) {
		return this.page
			.locator("section")
			.filter({
				has: this.page.getByRole("heading", { name: listName, exact: true }),
			})
			.first();
	}

	async expectDefaultLists() {
		for (const listName of ["To Do", "In Progress", "Done"]) {
			await expect(
				this.page.getByRole("heading", { name: listName, exact: true }),
			).toBeVisible();
		}
	}

	async createCard(listName: string, title: string) {
		const column = this.column(listName);

		await column.getByRole("button", { name: "Create card" }).click();

		const input = column.getByLabel(`New card title in ${listName}`);

		await expect(input).toBeVisible();
		await input.fill(title);
		await input.press("Enter");
	}

	card(listName: string, title: string) {
		return this.column(listName)
			.locator("button:not([disabled])")
			.filter({ hasText: title });
	}

	pendingCard(listName: string, title: string) {
		return this.column(listName)
			.locator("button[disabled]")
			.filter({ hasText: title });
	}

	async expectSettledCard(listName: string, title: string) {
		await expect(this.pendingCard(listName, title)).toHaveCount(0);

		const card = this.card(listName, title);

		await expect(card).toHaveCount(1);
		await expect(card).toBeVisible();
	}
}
