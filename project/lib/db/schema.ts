import {
	type AnyPgColumn,
	boolean,
	doublePrecision,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ============================= ENUMS =============================

export const occupationEnum = pgEnum("occupation", [
	"software_engineer",
	"qa_engineer",
	"product_manager",
	"designer",
	"devops_engineer",
	"student",
	"other",
]);

export type Occupation =
	| "software_engineer"
	| "qa_engineer"
	| "product_manager"
	| "designer"
	| "devops_engineer"
	| "student"
	| "other";

export const workspaceRoleEnum = pgEnum("workspace_role", [
	"owner",
	"admin",
	"member",
]);

export const workspaceInvitationStatusEnum = pgEnum(
	"workspace_invitation_status",
	["pending", "accepted", "declined", "revoked", "expired"],
);

export const projectStatusEnum = pgEnum("project_status", [
	"active",
	"archived",
	"completed",
]);

export const listTypeEnum = pgEnum("list_type", [
	"todo",
	"in_progress",
	"done",
]);

export const priorityEnum = pgEnum("priority", [
	"none",
	"low",
	"medium",
	"high",
]);

export const activityActionEnum = pgEnum("activity_action", [
	"created",
	"updated",
	"deleted",
	"archived",
	"restored",
	"assigned",
	"transferred",
	"unassigned",
	"completed",
	"moved",
	"invited",
	"joined",
	"accepted",
]);

export const activityEntityEnum = pgEnum("activity_entity", [
	"workspace",
	"workspace_member",
	"workspace_invitation",
	"project",
	"project_member",
	"list",
	"task",
	"comment",
	"label",
	"task_label",
]);

// ============================= USER TABLE SCHEMA =============================

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkId: text("clerk_id").notNull().unique(),
		email: text("email").notNull().unique(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		imageUrl: text("image_url"),
		occupation: occupationEnum("occupation"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		lastWorkspaceId: uuid("last_workspace_id").references(
			(): AnyPgColumn => workspaces.id,
			{ onDelete: "set null" },
		),
	},
	(table) => [
		index("users_clerk_id_index").on(table.clerkId),
		index("users_email_index").on(table.email),
	],
);

// ============================= WORKSPACE TABLE SCHEMA =============================

export const workspaces = pgTable("workspaces", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	color: varchar({
		length: 7,
	}).notNull(),
	logoUrl: text("logo_url"),
	createdById: uuid("created_by_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	setupCompleted: boolean("setup_completed").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// ============================= WORKSPACE MEMBERS TABLE SCHEMA =============================

export const workspaceMembers = pgTable(
	"workspace_members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: workspaceRoleEnum("role").notNull().default("member"),
		joinedAt: timestamp("joined_at").notNull().defaultNow(),
		// Presence lives on the membership row, not the user, so leaving a
		// workspace for another one lets this one age out on its own. Nullable:
		// a member who has never been seen must read as offline, not as online
		// at the moment the column was added.
		lastSeenAt: timestamp("last_seen_at"),
	},
	(table) => [
		unique().on(table.workspaceId, table.userId),

		index("workspaceMembers_workspace_id_index").on(table.workspaceId),
		index("workspaceMembers_user_id_index").on(table.userId),
	],
);

// ============================= WORKSPACE INVITATIONS TABLE SCHEMA =============================

export const workspaceInvitations = pgTable(
	"workspace_invitations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: workspaceRoleEnum("role").notNull().default("member"),
		token: text("token").notNull().unique(),
		status: workspaceInvitationStatusEnum("status")
			.notNull()
			.default("pending"),
		invitedById: uuid("invited_by_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.workspaceId, table.email),
		index("workspaceInvitations_workspace_id_index").on(table.workspaceId),
		index("workspaceInvitations_email_index").on(table.email),
		index("workspaceInvitations_status_index").on(table.status),
	],
);

// ============================= PROJECT TABLE SCHEMA =============================

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		leadId: uuid("lead_id").references(() => users.id, {
			onDelete: "set null",
		}),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		description: text("description"),
		logoUrl: text("logo_url"),
		color: varchar({ length: 7 }).notNull(),
		status: projectStatusEnum("status").notNull().default("active"),
		isArchived: boolean("is_archived").notNull().default(false),
		startDate: timestamp("start_date"),
		dueDate: timestamp("due_date"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique().on(table.workspaceId, table.slug),

		index("projects_workspace_id_index").on(table.workspaceId),
		index("projects_lead_id_index").on(table.leadId),
		index("projects_status_index").on(table.status),
	],
);

// ============================= PROJECT MEMBERS TABLE SCHEMA =============================

export const projectMembers = pgTable(
	"project_members",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		joinedAt: timestamp("joined_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.projectId, table.userId),

		index("projectMembers_project_id_index").on(table.projectId),
		index("projectMembers_user_id_index").on(table.userId),
	],
);

// ============================= LIST TABLE SCHEMA =============================

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		// Fractional: a reordered row takes the midpoint of its new neighbours,
		// so only that one row is rewritten on a drag.
		position: doublePrecision("position").notNull(),
		type: listTypeEnum("type").notNull().default("todo"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("lists_project_id_index").on(table.projectId)],
);

// ============================= TASK TABLE SCHEMA =============================

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		assigneeId: uuid("assignee_id").references(() => users.id, {
			onDelete: "set null",
		}),
		createdById: uuid("created_by_id")
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		priority: priorityEnum("priority").notNull(),
		// Fractional — see the note on lists.position.
		position: doublePrecision("position").notNull(),
		startDate: timestamp("start_date"),
		dueDate: timestamp("due_date"),
		completedAt: timestamp("completed_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("tasks_list_id_index").on(table.listId),
		index("tasks_assignee_id_index").on(table.assigneeId),
		index("tasks_created_by_id_index").on(table.createdById),
	],
);

// ============================= COMMENT TABLE SCHEMA =============================

export const comments = pgTable(
	"comments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		content: text("content").notNull(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "set null" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("comments_task_id_index").on(table.taskId),
		index("comments_author_id_index").on(table.authorId),
	],
);

// ============================= LABELS TABLE SCHEMA =============================

export const workspaceLabels = pgTable(
	"workspace_labels",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique().on(table.workspaceId, table.name),
		index("workspaceLabels_workspace_id_index").on(table.workspaceId),
	],
);

export const projectWorkspaceLabels = pgTable(
	"project_workspace_labels",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),
		workspaceLabelId: uuid("workspace_label_id")
			.notNull()
			.references(() => workspaceLabels.id, {
				onDelete: "cascade",
			}),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.projectId, table.workspaceLabelId),

		index("projectWorkspaceLabels_project_id_index").on(table.projectId),
		index("projectWorkspaceLabels_workspace_label_id_index").on(
			table.workspaceLabelId,
		),
	],
);

export const taskLabels = pgTable(
	"task_labels",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, {
				onDelete: "cascade",
			}),
		name: text("name").notNull(),
		color: text("color").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique().on(table.projectId, table.name),

		index("taskLabels_project_id_index").on(table.projectId),
	],
);

export const taskLabelAssignments = pgTable(
	"task_label_assignments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, {
				onDelete: "cascade",
			}),
		taskLabelId: uuid("task_label_id")
			.notNull()
			.references(() => taskLabels.id, {
				onDelete: "cascade",
			}),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.taskId, table.taskLabelId),

		index("taskLabelAssignments_task_id_index").on(table.taskId),
		index("taskLabelAssignments_task_label_id_index").on(table.taskLabelId),
	],
);

export const activityLogs = pgTable(
	"activity_logs",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		actorId: uuid("actor_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		action: activityActionEnum("action").notNull(),
		entity: activityEntityEnum("entity").notNull(),
		entityId: uuid("entity_id").notNull(),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("activityLogs_workspace_id_index").on(table.workspaceId),
		index("activityLogs_actor_id_index").on(table.actorId),
		index("activityLogs_entity_index").on(table.entity, table.entityId),
	],
);

// TODO: Task 3.1 - Design database schema for users, projects, lists, and tasks
// TODO: Task 3.3 - Set up Drizzle ORM with type-safe schema definitions

/*
TODO: Implementation Notes for Interns:

1. Install Drizzle ORM dependencies:
   - drizzle-orm
   - drizzle-kit
   - @vercel/postgres (if using Vercel Postgres)
   - OR pg + @types/pg (if using regular PostgreSQL)

2. Define schemas for:
   - users (id, clerkId, email, name, createdAt, updatedAt)
   - projects (id, name, description, ownerId, createdAt, updatedAt, dueDate)
   - lists (id, name, projectId, position, createdAt, updatedAt)
   - tasks (id, title, description, listId, assigneeId, priority, dueDate, position, createdAt, updatedAt)
   - comments (id, content, taskId, authorId, createdAt, updatedAt)

3. Set up proper relationships between tables
4. Add indexes for performance
5. Configure migrations

Example structure:
import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ... other tables
*/
