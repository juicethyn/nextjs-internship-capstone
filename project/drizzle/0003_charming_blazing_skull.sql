ALTER TYPE "public"."activity_action" ADD VALUE 'transferred' BEFORE 'unassigned';--> statement-breakpoint
ALTER TABLE "labels" RENAME COLUMN "project_id" TO "workspace_id";--> statement-breakpoint
ALTER TABLE "labels" DROP CONSTRAINT "labels_project_id_name_unique";--> statement-breakpoint
ALTER TABLE "labels" DROP CONSTRAINT "labels_project_id_projects_id_fk";
--> statement-breakpoint
DROP INDEX "labels_project_id_index";--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "labels_workspace_id_index" ON "labels" USING btree ("workspace_id");--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_workspace_id_name_unique" UNIQUE("workspace_id","name");