import { eq } from "drizzle-orm";
import { getOverviewRanges } from "@/features/dashboard/lib/date-range";
import { LABEL_COLORS } from "@/features/labels/constants";
import { WORKSPACE_COLORS } from "@/features/workspace/constants";
import { db } from "@/lib/db";
import { createDefaultLists } from "@/lib/db/queries/lists";
import { addProjectMember } from "@/lib/db/queries/projectMembers";
import { createProject } from "@/lib/db/queries/projects";
import { setProjectLabels } from "@/lib/db/queries/projectWorkspaceLabels";
import { createWorkspace } from "@/lib/db/queries/workspaces";
import {
	activityLogs,
	taskLabelAssignments,
	taskLabels,
	tasks,
	users,
	workspaceLabels,
} from "@/lib/db/schema";
import type { ListType, TaskPriority } from "@/lib/db/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const TASK_POSITION_STEP = 1000;

function toRichTextDoc(text: string) {
	if (!text) return null;

	return {
		type: "doc",
		content: [{ type: "paragraph", content: [{ type: "text", text }] }],
	};
}

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const WORKSPACE_NAME = "Demo Workspace";

const WORKSPACE_LABELS = [
	{ name: "Research", color: LABEL_COLORS[0] },
	{ name: "Engineering", color: LABEL_COLORS[1] },
	{ name: "Marketing", color: LABEL_COLORS[3] },
	{ name: "Academic", color: LABEL_COLORS[6] },
];

type DueSpec =
	| { kind: "none" }
	| { kind: "thisWeek"; daysFromToday: number }
	| { kind: "overdue"; daysAgo: number };

type CompletedSpec = "yesterday" | "dayBefore" | null;

type SeedTask = {
	title: string;
	description: string;
	priority: TaskPriority;
	list: ListType;
	labels: string[];
	due: DueSpec;
	completed: CompletedSpec;
};

type SeedProject = {
	name: string;
	description: string;
	color: string;
	workspaceLabels: string[];
	taskLabels: { name: string; color: string }[];
	tasks: SeedTask[];
};

const PROJECTS: SeedProject[] = [
	{
		name: "Freshwater Fish Thesis",
		description:
			"Undergraduate thesis investigating how water temperature affects the growth rate of freshwater tilapia in Laguna Lake.",
		color: WORKSPACE_COLORS[2],
		workspaceLabels: ["Research", "Academic"],
		taskLabels: [
			{ name: "Fieldwork", color: LABEL_COLORS[8] },
			{ name: "Data Analysis", color: LABEL_COLORS[6] },
			{ name: "Writing", color: LABEL_COLORS[11] },
		],
		tasks: [
			{
				title: "Secure lake access permit",
				description:
					"Coordinate with the local government unit for sampling clearance at the three study sites.",
				priority: "high",
				list: "done",
				labels: ["Fieldwork"],
				due: { kind: "none" },
				completed: "dayBefore",
			},
			{
				title: "Calibrate temperature loggers",
				description:
					"Validate all six HOBO loggers against a reference thermometer before deployment.",
				priority: "medium",
				list: "done",
				labels: ["Fieldwork"],
				due: { kind: "none" },
				completed: "yesterday",
			},
			{
				title: "Weekly tilapia growth measurements",
				description:
					"Record length and weight for the tagged sample population across all treatment tanks.",
				priority: "high",
				list: "in_progress",
				labels: ["Fieldwork", "Data Analysis"],
				due: { kind: "thisWeek", daysFromToday: 2 },
				completed: null,
			},
			{
				title: "Draft methodology chapter",
				description:
					"Write up the experimental design, sampling protocol and instrumentation sections.",
				priority: "medium",
				list: "in_progress",
				labels: ["Writing"],
				due: { kind: "thisWeek", daysFromToday: 4 },
				completed: null,
			},
			{
				title: "Water quality sampling at site B",
				description:
					"Collect dissolved oxygen, pH and turbidity readings. Site B was skipped last cycle.",
				priority: "high",
				list: "todo",
				labels: ["Fieldwork"],
				due: { kind: "overdue", daysAgo: 3 },
				completed: null,
			},
			{
				title: "Statistical analysis of growth curves",
				description:
					"Fit von Bertalanffy growth models per temperature treatment and test for significance.",
				priority: "medium",
				list: "todo",
				labels: ["Data Analysis"],
				due: { kind: "none" },
				completed: null,
			},
			{
				title: "Literature review on thermal tolerance",
				description:
					"Summarise recent studies on Oreochromis niloticus thermal tolerance ranges.",
				priority: "low",
				list: "todo",
				labels: ["Writing"],
				due: { kind: "none" },
				completed: null,
			},
		],
	},
	{
		name: "Fora Mobile App",
		description:
			"Cross-platform mobile client for the Fora project management tool, covering authentication, offline sync and push notifications.",
		color: WORKSPACE_COLORS[1],
		workspaceLabels: ["Engineering"],
		taskLabels: [
			{ name: "Frontend", color: LABEL_COLORS[0] },
			{ name: "Backend", color: LABEL_COLORS[1] },
			{ name: "Bug", color: LABEL_COLORS[4] },
		],
		tasks: [
			{
				title: "Set up React Native project",
				description:
					"Bootstrap the Expo workspace, shared ESLint config and CI build pipeline.",
				priority: "high",
				list: "done",
				labels: ["Frontend"],
				due: { kind: "none" },
				completed: "dayBefore",
			},
			{
				title: "Implement Clerk authentication flow",
				description:
					"Wire sign-in, sign-up and session persistence using the Clerk Expo SDK.",
				priority: "high",
				list: "done",
				labels: ["Frontend", "Backend"],
				due: { kind: "none" },
				completed: "yesterday",
			},
			{
				title: "Fix token refresh loop",
				description:
					"Expired refresh tokens retried indefinitely and drained the battery. Added backoff.",
				priority: "high",
				list: "done",
				labels: ["Bug", "Backend"],
				due: { kind: "none" },
				completed: "yesterday",
			},
			{
				title: "Offline sync queue",
				description:
					"Persist mutations locally while offline and replay them in order once connectivity returns.",
				priority: "high",
				list: "in_progress",
				labels: ["Backend"],
				due: { kind: "thisWeek", daysFromToday: 1 },
				completed: null,
			},
			{
				title: "Push notification service",
				description:
					"Deliver task assignment and mention notifications through Expo push tokens.",
				priority: "medium",
				list: "in_progress",
				labels: ["Backend"],
				due: { kind: "thisWeek", daysFromToday: 3 },
				completed: null,
			},
			{
				title: "Crash on cold start with expired session",
				description:
					"App terminates instead of redirecting to sign-in when the stored session is stale.",
				priority: "high",
				list: "todo",
				labels: ["Bug"],
				due: { kind: "overdue", daysAgo: 2 },
				completed: null,
			},
			{
				title: "Board drag and drop on mobile",
				description:
					"Replace the desktop dnd-kit interaction with a gesture-driven equivalent.",
				priority: "medium",
				list: "todo",
				labels: ["Frontend"],
				due: { kind: "none" },
				completed: null,
			},
			{
				title: "App icon and splash screen",
				description:
					"Produce the adaptive icon set and a splash screen for both light and dark themes.",
				priority: "low",
				list: "todo",
				labels: ["Frontend"],
				due: { kind: "none" },
				completed: null,
			},
		],
	},
	{
		name: "Q3 Market Research",
		description:
			"Competitor and pricing research for the Q3 go-to-market push, including survey design and a refresh of the buyer personas.",
		color: WORKSPACE_COLORS[3],
		workspaceLabels: ["Marketing", "Research"],
		taskLabels: [
			{ name: "Survey", color: LABEL_COLORS[6] },
			{ name: "Analysis", color: LABEL_COLORS[2] },
			{ name: "Content", color: LABEL_COLORS[5] },
		],
		tasks: [
			{
				title: "Define research objectives",
				description:
					"Agree the three questions this round of research has to answer before fieldwork starts.",
				priority: "high",
				list: "done",
				labels: ["Analysis"],
				due: { kind: "none" },
				completed: "yesterday",
			},
			{
				title: "Competitor pricing teardown",
				description:
					"Document tier structure, per-seat pricing and annual discounts across six competitors.",
				priority: "medium",
				list: "in_progress",
				labels: ["Analysis"],
				due: { kind: "thisWeek", daysFromToday: 0 },
				completed: null,
			},
			{
				title: "Survey questionnaire design",
				description:
					"Draft and pilot a fifteen-question instrument covering pricing sensitivity and feature demand.",
				priority: "medium",
				list: "in_progress",
				labels: ["Survey"],
				due: { kind: "thisWeek", daysFromToday: 4 },
				completed: null,
			},
			{
				title: "Recruit 20 survey participants",
				description:
					"Source respondents across the SMB and mid-market segments, balanced by role.",
				priority: "medium",
				list: "todo",
				labels: ["Survey"],
				due: { kind: "none" },
				completed: null,
			},
			{
				title: "Persona refresh workshop",
				description:
					"Half-day session to update the three buyer personas against this year's win/loss data.",
				priority: "low",
				list: "todo",
				labels: ["Content"],
				due: { kind: "none" },
				completed: null,
			},
			{
				title: "Synthesise findings into a report",
				description:
					"Produce the executive summary deck with recommendations for the Q3 pricing page.",
				priority: "medium",
				list: "todo",
				labels: ["Analysis", "Content"],
				due: { kind: "none" },
				completed: null,
			},
			{
				title: "Publish pricing page copy",
				description:
					"Rewrite the pricing page based on the research conclusions and hand off to design.",
				priority: "low",
				list: "todo",
				labels: ["Content"],
				due: { kind: "none" },
				completed: null,
			},
		],
	},
];

function usage(message?: string) {
	if (message) console.error(`\nError: ${message}`);

	console.error(`
Usage: pnpm exec tsx scripts/seed-workspace.ts <userId>

Adds one new workspace with three sample projects to an existing user.
Existing data is never modified or deleted.

  <userId>  A uuid from the "users" table (not a Clerk id).
`);

	process.exit(1);
}

async function main() {
	const userId = process.argv[2];

	if (!userId) usage("No user id supplied.");
	if (!UUID_PATTERN.test(userId)) {
		usage(`"${userId}" is not a valid uuid.`);
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!user) {
		usage(
			`No user found with id ${userId}. Note this is the internal users.id, not the Clerk id.`,
		);
		return;
	}

	const ranges = getOverviewRanges(new Date());

	const resolveDue = (due: DueSpec) => {
		if (due.kind === "thisWeek") {
			const target = ranges.todayStart.getTime() + due.daysFromToday * DAY_MS;
			const lastDayOfWeek = ranges.weekEnd.getTime() - DAY_MS;

			return new Date(Math.min(target, lastDayOfWeek));
		}

		if (due.kind === "overdue") {
			return new Date(ranges.todayStart.getTime() - due.daysAgo * DAY_MS);
		}

		return null;
	};

	const resolveCompleted = (completed: CompletedSpec) => {
		if (completed === "yesterday") {
			return new Date(ranges.yesterdayStart.getTime() + 10 * HOUR_MS);
		}

		if (completed === "dayBefore") {
			return new Date(ranges.dayBeforeStart.getTime() + 10 * HOUR_MS);
		}

		return null;
	};

	const result = await db.transaction(async (tx) => {
		const workspace = await createWorkspace(
			user.id,
			{ name: WORKSPACE_NAME, color: WORKSPACE_COLORS[0] },
			tx,
		);

		const insertedWorkspaceLabels = await tx
			.insert(workspaceLabels)
			.values(
				WORKSPACE_LABELS.map((label) => ({
					...label,
					workspaceId: workspace.id,
				})),
			)
			.returning();

		const workspaceLabelIdByName = new Map(
			insertedWorkspaceLabels.map((label) => [label.name, label.id]),
		);

		const summaries = [];
		const seedNow = new Date();

		for (const [projectIndex, spec] of PROJECTS.entries()) {
			const project = await createProject(
				workspace.id,
				user.id,
				{
					name: spec.name,
					description: spec.description,
					color: spec.color,
					startDate: new Date(ranges.todayStart.getTime() - 14 * DAY_MS),
					dueDate: new Date(ranges.todayStart.getTime() + 45 * DAY_MS),
				},
				tx,
			);

			await addProjectMember(project.id, user.id, tx);

			const projectLists = await createDefaultLists(project.id, tx);

			const listIdByType = new Map(
				projectLists.map((list) => [list.type, list.id]),
			);

			await setProjectLabels(
				project.id,
				spec.workspaceLabels
					.map((name) => workspaceLabelIdByName.get(name))
					.filter((id): id is string => Boolean(id)),
				tx,
			);

			const insertedTaskLabels = await tx
				.insert(taskLabels)
				.values(
					spec.taskLabels.map((label) => ({
						...label,
						projectId: project.id,
					})),
				)
				.returning();

			const taskLabelIdByName = new Map(
				insertedTaskLabels.map((label) => [label.name, label.id]),
			);

			const positionByList = new Map<string, number>();

			const taskValues = spec.tasks.map((task) => {
				const listId = listIdByType.get(task.list);

				if (!listId) {
					throw new Error(`Missing default list "${task.list}"`);
				}

				const nextPosition =
					(positionByList.get(listId) ?? 0) + TASK_POSITION_STEP;
				positionByList.set(listId, nextPosition);

				return {
					title: task.title,
					description: toRichTextDoc(task.description),
					listId,
					createdById: user.id,
					assigneeId: user.id,
					priority: task.priority,
					position: nextPosition,
					dueDate: resolveDue(task.due),
					completedAt: resolveCompleted(task.completed),
				};
			});

			const insertedTasks = await tx
				.insert(tasks)
				.values(taskValues)
				.returning();

			const assignments = spec.tasks.flatMap((task, index) =>
				task.labels
					.map((name) => taskLabelIdByName.get(name))
					.filter((id): id is string => Boolean(id))
					.map((taskLabelId) => ({
						taskId: insertedTasks[index].id,
						taskLabelId,
					})),
			);

			if (assignments.length > 0) {
				await tx.insert(taskLabelAssignments).values(assignments);
			}

			const activityValues: (typeof activityLogs.$inferInsert)[] = [
				{
					workspaceId: workspace.id,
					actorId: user.id,
					projectId: project.id,
					action: "created",
					entity: "project",
					entityId: project.id,
					metadata: { name: project.name },
					createdAt: new Date(
						seedNow.getTime() - 5 * DAY_MS + projectIndex * HOUR_MS,
					),
				},
			];

			for (const [taskIndex, task] of insertedTasks.entries()) {
				const hoursAgo = 2 + taskIndex * 12 + projectIndex * 4;

				activityValues.push({
					workspaceId: workspace.id,
					actorId: user.id,
					projectId: project.id,
					action: "created",
					entity: "task",
					entityId: task.id,
					metadata: { name: task.title },
					createdAt: new Date(seedNow.getTime() - hoursAgo * HOUR_MS),
				});

				if (task.completedAt) {
					activityValues.push({
						workspaceId: workspace.id,
						actorId: user.id,
						projectId: project.id,
						action: "completed",
						entity: "task",
						entityId: task.id,
						metadata: { name: task.title },
						createdAt: task.completedAt,
					});
				}
			}

			await tx.insert(activityLogs).values(activityValues);

			summaries.push({
				name: project.name,
				slug: project.slug,
				tasks: insertedTasks.length,
				labels: insertedTaskLabels.length,
				activity: activityValues.length,
			});
		}

		return { workspace, summaries, workspaceLabels: insertedWorkspaceLabels };
	});

	const allTasks = PROJECTS.flatMap((project) => project.tasks);

	const completedYesterday = allTasks.filter(
		(task) => task.completed === "yesterday",
	).length;
	const completedDayBefore = allTasks.filter(
		(task) => task.completed === "dayBefore",
	).length;

	const dueThisWeek = allTasks.filter((task) => {
		if (task.completed) return false;
		const due = resolveDue(task.due);
		if (!due) return false;
		return due >= ranges.weekStart && due < ranges.weekEnd;
	}).length;

	const overdue = allTasks.filter((task) => {
		if (task.completed) return false;
		const due = resolveDue(task.due);
		if (!due) return false;
		return due < ranges.todayStart;
	}).length;

	console.log(`
Seeded workspace for ${user.firstName} ${user.lastName} <${user.email}>

  Workspace : ${result.workspace.name}
  Slug      : ${result.workspace.slug}
  Dashboard : /w/${result.workspace.slug}/dashboard
  Labels    : ${result.workspaceLabels.map((label) => label.name).join(", ")}
`);

	for (const summary of result.summaries) {
		console.log(
			`  - ${summary.name} (${summary.slug}) — ${summary.tasks} tasks, ${summary.labels} task labels, ${summary.activity} activity events`,
		);
	}

	console.log(`
This workspace contributes the following to the overview cards:

  Active Projects     ${result.summaries.length}  (+${result.summaries.length} new this week)
  Team Members        1
  Completed Yesterday ${completedYesterday}  (${completedYesterday - completedDayBefore >= 0 ? "+" : ""}${completedYesterday - completedDayBefore} from previous day)
  Due This Week       ${dueThisWeek}  (${overdue} overdue)

Existing workspaces were not modified.
`);

	process.exit(0);
}

main().catch((error) => {
	console.error("\nSeed failed. No rows were committed.\n");
	console.error(error);
	process.exit(1);
});
