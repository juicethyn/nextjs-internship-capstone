CREATE TYPE "public"."activity_action" AS ENUM('created', 'updated', 'deleted', 'archived', 'restored', 'assigned', 'unassigned', 'completed', 'moved', 'invited', 'joined');--> statement-breakpoint
CREATE TYPE "public"."activity_entity" AS ENUM('workspace', 'project', 'list', 'task', 'comment', 'label');--> statement-breakpoint
CREATE TYPE "public"."list_type" AS ENUM('todo', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('member');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'archived', 'completed');--> statement-breakpoint
CREATE TYPE "public"."workspace_invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
ALTER TYPE "public"."job_title" RENAME TO "occupation";--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" "activity_action" NOT NULL,
	"entity" "activity_entity" NOT NULL,
	"entity_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "labels_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "task_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_labels_task_id_label_id_unique" UNIQUE("task_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"status" "workspace_invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_invitations_workspace_id_email_unique" UNIQUE("workspace_id","email")
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_workspace_id_user_id_unique" UNIQUE("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "owner_id" TO "workspace_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "job_title" TO "occupation";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "projects_owner_id_index";--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "type" "list_type" DEFAULT 'todo' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lead_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "project_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_by_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activityLogs_workspace_id_index" ON "activity_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "activityLogs_actor_id_index" ON "activity_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "activityLogs_entity_index" ON "activity_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "labels_project_id_index" ON "labels" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projectMembers_project_id_index" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projectMembers_user_id_index" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "taskLabels_task_id_index" ON "task_labels" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "taskLabels_label_id_index" ON "task_labels" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "workspaceInvitations_workspace_id_index" ON "workspace_invitations" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspaceInvitations_email_index" ON "workspace_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "workspaceInvitations_status_index" ON "workspace_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workspaceMembers_workspace_id_index" ON "workspace_members" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspaceMembers_user_id_index" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_users_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "projects_workspace_id_index" ON "projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "projects_lead_id_index" ON "projects" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "projects_status_index" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_created_by_id_index" ON "tasks" USING btree ("created_by_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_slug_unique" UNIQUE("workspace_id","slug");