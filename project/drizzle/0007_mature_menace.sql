ALTER TABLE "activity_logs" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activityLogs_project_id_index" ON "activity_logs" USING btree ("project_id");