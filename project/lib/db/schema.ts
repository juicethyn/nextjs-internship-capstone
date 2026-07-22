import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// ============================= ENUMS =============================

export const jobTitleEnum = pgEnum("job_title", [
	"software_engineer",
	"qa_engineer",
	"product_manager",
	"designer",
	"devops_engineer",
	"other",
]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// ============================= USER TABLE SCHEMA =============================

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkId: text("clerk_id").notNull().unique(),
		email: text("email").notNull().unique(),
		imageUrl: text("image_url"),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		jobTitle: jobTitleEnum("job_title"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("users_clerk_id_index").on(table.clerkId),
		index("users_email_index").on(table.email),
	],
);

// ============================= PROJECT TABLE SCHEMA =============================

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		dueDate: timestamp("due_date"),
	},
	(table) => [index("projects_owner_id_index").on(table.ownerId)],
);

// ============================= LIST TABLE SCHEMA =============================

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		position: integer("position").notNull(),
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
		priority: priorityEnum("priority").notNull(),
		dueDate: timestamp("due_date"),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("tasks_list_id_index").on(table.listId),
		index("tasks_assignee_id_index").on(table.assigneeId),
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
