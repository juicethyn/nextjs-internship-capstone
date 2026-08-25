import { expect, test } from "@playwright/test";
import { BoardPage } from "./pom/board.page";
import { OnboardingPage } from "./pom/onboarding.page";
import { ProjectsPage } from "./pom/projects.page";
import { SignInPage } from "./pom/sign-in.page";

const runId = Date.now().toString().slice(-6);
const WORKSPACE_NAME = `E2E Workspace ${runId}`;
const PROJECT_NAME = `E2E Project ${runId}`;
const TASK_TITLE = `E2E Task ${runId}`;
const OCCUPATION = "Software Engineer";

test("first-time user signs in, onboards, and creates a project with a task", async ({
	page,
}) => {
	const signInPage = new SignInPage(page);
	const onboarding = new OnboardingPage(page);
	const projects = new ProjectsPage(page);
	const board = new BoardPage(page);

	await test.step("signs in and lands on onboarding", async () => {
		await signInPage.goto();
		await signInPage.signIn();

		await expect(page).toHaveURL(/\/onboarding$/);
		await onboarding.expectWorkspaceStep();
	});

	await test.step("names the workspace", async () => {
		await onboarding.createWorkspace(WORKSPACE_NAME);
		await onboarding.expectInviteStep(WORKSPACE_NAME);
	});

	await test.step("skips inviting members", async () => {
		await onboarding.skipInvites();
		await onboarding.expectProfileStep();
	});

	await test.step("picks an occupation and completes onboarding", async () => {
		await onboarding.selectOccupation(OCCUPATION);
		await onboarding.finish();

		await page.waitForURL(/\/w\/[^/]+\/dashboard$/);

		await expect(
			page.getByRole("heading", { name: "Dashboard" }),
		).toBeVisible();
		await expect(
			page.getByText(WORKSPACE_NAME, { exact: false }).first(),
		).toBeVisible();
	});

	const workspaceSlug = new URL(page.url()).pathname.split("/")[2];

	await test.step("creates a project", async () => {
		await projects.gotoFromSidebar();
		await projects.openCreateDialog();
		await projects.createProject(PROJECT_NAME);

		await page.waitForURL(/\/projects\/p-/);

		await expect(
			page.getByRole("heading", { name: PROJECT_NAME, exact: true }),
		).toBeVisible();
		await board.expectDefaultLists();
	});

	const boardUrl = page.url();

	await test.step("creates a task on the board", async () => {
		await board.createCard("To Do", TASK_TITLE);

		await expect(page.getByText("Card created.")).toBeVisible();
		await board.expectSettledCard("To Do", TASK_TITLE);
	});

	await test.step("verifies everything persisted after a reload", async () => {
		await page.goto(boardUrl);

		await board.expectDefaultLists();
		await board.expectSettledCard("To Do", TASK_TITLE);
		await expect(board.column("To Do")).toContainText(TASK_TITLE);

		await page.goto(`/w/${workspaceSlug}/projects`);

		await expect(
			page.getByRole("heading", { name: "Browse Projects" }),
		).toBeVisible();
		await expect(projects.projectLink(PROJECT_NAME)).toBeVisible();
	});
});
