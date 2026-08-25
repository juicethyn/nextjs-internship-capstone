import { eq } from "drizzle-orm";
import { getOverviewRanges } from "@/features/dashboard/lib/date-range";
import { LABEL_COLORS } from "@/features/labels/constants";
import { WORKSPACE_COLORS } from "@/features/workspace/constants";
import { db } from "@/lib/db";
import { createDefaultLists } from "@/lib/db/queries/lists";
import { addProjectMember } from "@/lib/db/queries/projectMembers";
import { createProject } from "@/lib/db/queries/projects";
import { setProjectLabels } from "@/lib/db/queries/projectWorkspaceLabels";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getWorkspaceBySlug } from "@/lib/db/queries/workspaces";
import {
	activityLogs,
	comments,
	taskLabelAssignments,
	taskLabels,
	tasks,
	workspaceLabels,
} from "@/lib/db/schema";
import type { ListType, TaskPriority } from "@/lib/db/types";
import { POSITION_STEP } from "@/lib/positioning";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function toRichTextDoc(text: string) {
	if (!text) return null;

	return {
		type: "doc",
		content: [{ type: "paragraph", content: [{ type: "text", text }] }],
	};
}

const WORKSPACE_LABELS = [
	{ name: "Research", color: LABEL_COLORS[0] },
	{ name: "Engineering", color: LABEL_COLORS[1] },
	{ name: "Marketing", color: LABEL_COLORS[3] },
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
	comments?: string[];
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
				comments: [
					"Expo SDK 52 it is — the dev client builds on both platforms and CI is green.",
				],
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
				comments: [
					"Session persistence is on SecureStore now, so a cold start keeps the user signed in.",
				],
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
				comments: [
					"Exponential backoff capped at five attempts, then we force a sign-out. Verified on a physical device overnight.",
				],
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
				comments: [
					"Queue is persisting to SQLite now. Each mutation stores its payload plus a monotonic sequence number.",
					"Replay ordering is the tricky part — two edits to the same task can land out of order if we fire them in parallel.",
					"Serialised replay per task id fixes it. Throughput is fine since the queue is rarely more than a few dozen entries.",
				],
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
				comments: [
					"Token registration is wired to the existing notification preferences, so muted categories never reach the device.",
					"Still need to handle token rotation — Expo hands out a new one after a reinstall and the old row goes stale.",
				],
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
				comments: [
					"Locked to three: where we sit on price, which features actually drive the decision, and who signs off.",
				],
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
				comments: [
					"Four of six are captured. Two of them hide pricing behind a sales call, so those rows are estimates from published case studies.",
					"Annual discounts cluster around 15–20%, which is well below what we assumed when we set our own.",
					"Adding a per-seat normalised column so the comparison holds for the mid-market tier.",
				],
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
				comments: [
					"Draft is at eighteen questions — needs trimming, the pilot group dropped off around question twelve.",
					"Cut the three demographic questions we can pull from the CRM instead.",
				],
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
Usage: pnpm db:seed <clerkId> <workspaceSlug>

Adds two sample projects (lists, tasks, labels, comments, activity) to an
existing workspace. Existing data is never modified or deleted.

  <clerkId>        A Clerk user id starting with "user_", not the users.id uuid.
  <workspaceSlug>  The slug from the workspace url, e.g. /w/<workspaceSlug>/dashboard.
`);

	process.exit(1);
}

async function main() {
	const [clerkId, workspaceSlug] = process.argv.slice(2);

	if (!clerkId) usage("No Clerk id supplied.");
	if (!workspaceSlug) usage("No workspace slug supplied.");

	if (!clerkId.startsWith("user_")) {
		usage(
			`"${clerkId}" is not a Clerk id. Clerk ids start with "user_" — this is not the users.id uuid.`,
		);
	}

	const user = await getUserByClerkId(clerkId);

	if (!user) {
		usage(`No user found with Clerk id ${clerkId}.`);
		return;
	}

	const workspace = await getWorkspaceBySlug(workspaceSlug);

	if (!workspace) {
		usage(`No workspace found with slug "${workspaceSlug}".`);
		return;
	}

	if (!workspace.members.some((member) => member.userId === user.id)) {
		usage(
			`${user.firstName} ${user.lastName} is not a member of "${workspace.name}" (${workspaceSlug}). Seeded projects would not be visible to them.`,
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
		const existingWorkspaceLabels = await tx
			.select()
			.from(workspaceLabels)
			.where(eq(workspaceLabels.workspaceId, workspace.id));

		const workspaceLabelIdByName = new Map(
			existingWorkspaceLabels.map((label) => [label.name, label.id]),
		);

		const reusedLabelNames: string[] = [];
		const neededLabelNames = new Set(
			PROJECTS.flatMap((spec) => spec.workspaceLabels),
		);

		const missingLabels = WORKSPACE_LABELS.filter((label) => {
			if (!neededLabelNames.has(label.name)) return false;

			if (workspaceLabelIdByName.has(label.name)) {
				reusedLabelNames.push(label.name);
				return false;
			}

			return true;
		});

		if (missingLabels.length > 0) {
			const insertedWorkspaceLabels = await tx
				.insert(workspaceLabels)
				.values(
					missingLabels.map((label) => ({
						...label,
						workspaceId: workspace.id,
					})),
				)
				.onConflictDoNothing()
				.returning();

			for (const label of insertedWorkspaceLabels) {
				workspaceLabelIdByName.set(label.name, label.id);
			}
		}

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

				const nextPosition = (positionByList.get(listId) ?? 0) + POSITION_STEP;
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

			const commentValues = spec.tasks.flatMap((task, index) => {
				if (!task.comments?.length) return [];

				const insertedTask = insertedTasks[index];

				return task.comments.map((content, commentIndex) => {
					const postedAt = new Date(
						seedNow.getTime() - (48 - commentIndex * 3) * HOUR_MS,
					);

					return {
						taskId: insertedTask.id,
						authorId: user.id,
						content,
						createdAt: insertedTask.completedAt
							? new Date(
									Math.min(
										postedAt.getTime(),
										insertedTask.completedAt.getTime() - HOUR_MS,
									),
								)
							: postedAt,
					};
				});
			});

			const insertedComments =
				commentValues.length > 0
					? await tx.insert(comments).values(commentValues).returning()
					: [];

			const taskTitleById = new Map(
				insertedTasks.map((task) => [task.id, task.title]),
			);

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

			for (const comment of insertedComments) {
				activityValues.push({
					workspaceId: workspace.id,
					actorId: user.id,
					projectId: project.id,
					action: "created",
					entity: "comment",
					entityId: comment.id,
					metadata: { taskTitle: taskTitleById.get(comment.taskId) },
					createdAt: comment.createdAt,
				});
			}

			await tx.insert(activityLogs).values(activityValues);

			summaries.push({
				name: project.name,
				slug: project.slug,
				tasks: insertedTasks.length,
				labels: insertedTaskLabels.length,
				comments: insertedComments.length,
				activity: activityValues.length,
			});
		}

		const createdLabelNames = [...neededLabelNames].filter(
			(name) => !reusedLabelNames.includes(name),
		);

		return { summaries, reusedLabelNames, createdLabelNames };
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
Seeded projects for ${user.firstName} ${user.lastName} <${user.email}>

  Workspace : ${workspace.name}
  Slug      : ${workspace.slug}
  Dashboard : /w/${workspace.slug}/dashboard
  Labels    : reused ${result.reusedLabelNames.join(", ") || "none"} | created ${result.createdLabelNames.join(", ") || "none"}
`);

	for (const summary of result.summaries) {
		console.log(
			`  - ${summary.name} (${summary.slug}) — ${summary.tasks} tasks, ${summary.labels} task labels, ${summary.comments} comments, ${summary.activity} activity events`,
		);
	}

	console.log(`
These projects contribute the following to the overview cards:

  Active Projects     ${result.summaries.length}  (+${result.summaries.length} new this week)
  Completed Yesterday ${completedYesterday}  (${completedYesterday - completedDayBefore >= 0 ? "+" : ""}${completedYesterday - completedDayBefore} from previous day)
  Due This Week       ${dueThisWeek}  (${overdue} overdue)

The workspace's existing projects and labels were not modified.
`);

	process.exit(0);
}

main().catch((error) => {
	console.error("\nSeed failed. No rows were committed.\n");
	console.error(error);
	process.exit(1);
});
