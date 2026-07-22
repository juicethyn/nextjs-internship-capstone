import { relations } from "drizzle-orm";
import * as schema from "./schema";

export const usersRelations = relations(schema.users, ({ many }) => ({
	ownedProjects: many(schema.projects),
	assignedTasks: many(schema.tasks),
	comments: many(schema.comments),
}));

export const projectsRelations = relations(
	schema.projects,
	({ many, one }) => ({
		owner: one(schema.users, {
			fields: [schema.projects.ownerId],
			references: [schema.users.id],
		}),
		lists: many(schema.lists),
	}),
);

export const listsRelations = relations(schema.lists, ({ many, one }) => ({
	project: one(schema.projects, {
		fields: [schema.lists.projectId],
		references: [schema.projects.id],
	}),
	tasks: many(schema.tasks),
}));

export const tasksRelations = relations(schema.tasks, ({ many, one }) => ({
	list: one(schema.lists, {
		fields: [schema.tasks.listId],
		references: [schema.lists.id],
	}),
	assignee: one(schema.users, {
		fields: [schema.tasks.assigneeId],
		references: [schema.users.id],
	}),
	comments: many(schema.comments),
}));

export const commentsRelations = relations(schema.comments, ({ one }) => ({
	task: one(schema.tasks, {
		fields: [schema.comments.taskId],
		references: [schema.tasks.id],
	}),
	author: one(schema.users, {
		fields: [schema.comments.authorId],
		references: [schema.users.id],
	}),
}));
