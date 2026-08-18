import { relations } from "drizzle-orm";
import * as schema from "./schema";
import { users, workspaceInvitations, workspaces } from "./schema";

export const usersRelations = relations(schema.users, ({ many }) => ({
	workspaceMembership: many(schema.workspaceMembers),
	createdWorkspaces: many(schema.workspaces),
	assignedTasks: many(schema.tasks, {
		relationName: "assignee",
	}),
	createdTasks: many(schema.tasks, {
		relationName: "creator",
	}),
	comments: many(schema.comments),
	activities: many(schema.activityLogs),
}));

export const workspacesRelations = relations(
	schema.workspaces,
	({ one, many }) => ({
		creator: one(schema.users, {
			fields: [schema.workspaces.createdById],
			references: [schema.users.id],
		}),
		members: many(schema.workspaceMembers),
		invitations: many(schema.workspaceInvitations),
		projects: many(schema.projects),
		labels: many(schema.workspaceLabels),
		activityLogs: many(schema.activityLogs),
	}),
);

export const workspaceInvitationsRelations = relations(
	workspaceInvitations,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceInvitations.workspaceId],
			references: [workspaces.id],
			relationName: "workspaceInvitations",
		}),
		invitedBy: one(users, {
			fields: [workspaceInvitations.invitedById],
			references: [users.id],
		}),
	}),
);

export const workspaceMembersRelations = relations(
	schema.workspaceMembers,
	({ one }) => ({
		workspace: one(schema.workspaces, {
			fields: [schema.workspaceMembers.workspaceId],
			references: [schema.workspaces.id],
		}),
		user: one(schema.users, {
			fields: [schema.workspaceMembers.userId],
			references: [schema.users.id],
		}),
	}),
);

export const projectsRelations = relations(
	schema.projects,
	({ one, many }) => ({
		workspace: one(schema.workspaces, {
			fields: [schema.projects.workspaceId],
			references: [schema.workspaces.id],
		}),
		lead: one(schema.users, {
			fields: [schema.projects.leadId],
			references: [schema.users.id],
		}),
		members: many(schema.projectMembers),
		lists: many(schema.lists),
		projectLabels: many(schema.projectWorkspaceLabels),
		taskLabels: many(schema.taskLabels),
		events: many(schema.events),
	}),
);

export const eventsRelations = relations(schema.events, ({ one }) => ({
	project: one(schema.projects, {
		fields: [schema.events.projectId],
		references: [schema.projects.id],
	}),
	creator: one(schema.users, {
		fields: [schema.events.createdById],
		references: [schema.users.id],
	}),
}));

export const projectMembersRelations = relations(
	schema.projectMembers,
	({ one }) => ({
		project: one(schema.projects, {
			fields: [schema.projectMembers.projectId],
			references: [schema.projects.id],
		}),
		user: one(schema.users, {
			fields: [schema.projectMembers.userId],
			references: [schema.users.id],
		}),
	}),
);

export const listsRelations = relations(schema.lists, ({ one, many }) => ({
	project: one(schema.projects, {
		fields: [schema.lists.projectId],
		references: [schema.projects.id],
	}),
	tasks: many(schema.tasks),
}));

export const tasksRelations = relations(schema.tasks, ({ one, many }) => ({
	list: one(schema.lists, {
		fields: [schema.tasks.listId],
		references: [schema.lists.id],
	}),
	assignee: one(schema.users, {
		fields: [schema.tasks.assigneeId],
		references: [schema.users.id],
		relationName: "assignedTasks",
	}),
	creator: one(schema.users, {
		fields: [schema.tasks.createdById],
		references: [schema.users.id],
		relationName: "createdTasks",
	}),
	comments: many(schema.comments),
	taskLabels: many(schema.taskLabelAssignments),
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

export const workspaceLabelsRelations = relations(
	schema.workspaceLabels,
	({ one, many }) => ({
		workspace: one(schema.workspaces, {
			fields: [schema.workspaceLabels.workspaceId],
			references: [schema.workspaces.id],
		}),

		projects: many(schema.projectWorkspaceLabels),
	}),
);

export const projectWorkspaceLabelsRelations = relations(
	schema.projectWorkspaceLabels,
	({ one }) => ({
		project: one(schema.projects, {
			fields: [schema.projectWorkspaceLabels.projectId],
			references: [schema.projects.id],
		}),
		workspaceLabel: one(schema.workspaceLabels, {
			fields: [schema.projectWorkspaceLabels.workspaceLabelId],
			references: [schema.workspaceLabels.id],
		}),
	}),
);

export const taskLabelsRelations = relations(
	schema.taskLabels,
	({ one, many }) => ({
		project: one(schema.projects, {
			fields: [schema.taskLabels.projectId],
			references: [schema.projects.id],
		}),
		tasks: many(schema.taskLabelAssignments),
	}),
);

export const taskLabelAssignmentsRelations = relations(
	schema.taskLabelAssignments,
	({ one }) => ({
		task: one(schema.tasks, {
			fields: [schema.taskLabelAssignments.taskId],
			references: [schema.tasks.id],
		}),
		taskLabel: one(schema.taskLabels, {
			fields: [schema.taskLabelAssignments.taskLabelId],
			references: [schema.taskLabels.id],
		}),
	}),
);

export const activityLogsRelations = relations(
	schema.activityLogs,
	({ one }) => ({
		workspace: one(schema.workspaces, {
			fields: [schema.activityLogs.workspaceId],
			references: [schema.workspaces.id],
		}),
		actor: one(schema.users, {
			fields: [schema.activityLogs.actorId],
			references: [schema.users.id],
		}),
		project: one(schema.projects, {
			fields: [schema.activityLogs.projectId],
			references: [schema.projects.id],
		}),
	}),
);
